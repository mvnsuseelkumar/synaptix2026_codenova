"""Resume parsing service — extracts text, sections, skills, and scores from PDF resumes."""

import re
import logging
from typing import Dict, List, Tuple

import pdfplumber
from beanie import PydanticObjectId

from utils.skill_normalizer import normalize_skill, normalize_skills
from utils.constants import (
    SECTION_HEADERS,
    WORK_EXP_WEIGHT,
    PROJECTS_WEIGHT,
    CERTIFICATIONS_WEIGHT,
    EDUCATION_WEIGHT,
    DURATION_6M_BOOST,
    DURATION_12M_BOOST,
    MAX_SKILL_SCORE,
    PARSE_DONE,
    PARSE_FAILED,
    PARSE_PROCESSING,
)

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> str:
    """Step 1 — Extract full raw text from PDF using pdfplumber."""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        raise
    return text.strip()


def detect_sections(raw_text: str) -> Dict[str, str]:
    """Step 2 — Rule-based regex section detection.

    Split text into sections based on known header patterns.
    """
    sections = {
        "education": "",
        "experience": "",
        "projects": "",
        "certifications": "",
        "courses": "",
        "skills": "",
    }

    # Build a combined pattern that matches any section header
    all_patterns = []
    for section_key, patterns in SECTION_HEADERS.items():
        for p in patterns:
            all_patterns.append((section_key, p))

    # Find all header positions
    header_positions: List[Tuple[int, int, str]] = []
    for section_key, pattern in all_patterns:
        regex = re.compile(
            r"(?:^|\n)\s*" + pattern + r"[:\s]*(?:\n|$)",
            re.IGNORECASE | re.MULTILINE,
        )
        for match in regex.finditer(raw_text):
            header_positions.append((match.start(), match.end(), section_key))

    # Sort by position in document
    header_positions.sort(key=lambda x: x[0])

    # Extract text between headers
    for i, (start, end, section_key) in enumerate(header_positions):
        next_start = header_positions[i + 1][0] if i + 1 < len(header_positions) else len(raw_text)
        section_text = raw_text[end:next_start].strip()
        if section_text:
            if sections[section_key]:
                sections[section_key] += "\n" + section_text
            else:
                sections[section_key] = section_text

    return sections


def extract_skills_from_text(text: str) -> List[str]:
    """Extract skill-like tokens from text using heuristic approach.

    Uses NER-like extraction with a broad skill detection pattern.
    """
    try:
        import spacy
        nlp = spacy.load("en_core_web_lg")
    except Exception:
        nlp = None

    skills_found = []

    # Try spaCy NER
    if nlp:
        doc = nlp(text[:100000])  # Limit processing length
        for ent in doc.ents:
            if ent.label_ in ("ORG", "PRODUCT", "WORK_OF_ART"):
                skills_found.append(ent.text)

    # Try pyresparser
    try:
        from pyresparser import ResumeParser
        import tempfile
        import os

        # pyresparser needs a file, create a temp text file
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False, encoding="utf-8") as f:
            f.write(text)
            temp_path = f.name

        try:
            data = ResumeParser(temp_path).get_extracted_data()
            if data and data.get("skills"):
                skills_found.extend(data["skills"])
        finally:
            os.unlink(temp_path)
    except Exception as e:
        logger.warning(f"pyresparser extraction failed, using fallback: {e}")

    # Fallback: pattern-based skill extraction from skills section
    # Common tech skills patterns
    tech_patterns = [
        r'\b(?:Python|Java|JavaScript|TypeScript|C\+\+|C#|Ruby|Go|Rust|Swift|Kotlin|PHP|Scala|R)\b',
        r'\b(?:React|Angular|Vue|Next\.js|Node\.js|Express|Django|Flask|FastAPI|Spring)\b',
        r'\b(?:MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch|DynamoDB|SQLite|Cassandra)\b',
        r'\b(?:AWS|Azure|GCP|Docker|Kubernetes|Terraform|Jenkins|CI/CD)\b',
        r'\b(?:TensorFlow|PyTorch|Scikit-learn|Pandas|NumPy|Keras)\b',
        r'\b(?:Git|Linux|Bash|REST|GraphQL|HTML|CSS|SASS)\b',
        r'\b(?:Machine\s+Learning|Deep\s+Learning|NLP|Computer\s+Vision|Data\s+Science)\b',
        r'\b(?:Agile|Scrum|Jira|Figma|Tableau|Power\s+BI)\b',
    ]

    for pattern in tech_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        skills_found.extend(matches)

    # Normalize & deduplicate
    normalized = normalize_skills(skills_found)
    return normalized


def count_skill_occurrences(skill: str, text: str) -> int:
    """Count how many times a skill appears in text (case-insensitive)."""
    if not text:
        return 0
    pattern = re.compile(re.escape(skill), re.IGNORECASE)
    return len(pattern.findall(text))


def extract_durations_months(text: str) -> List[float]:
    """Extract employment durations from text in months."""
    durations = []

    try:
        import dateparser
        # Look for date range patterns like "Jan 2020 - Dec 2021"
        date_range_pattern = re.compile(
            r'(\w+\s+\d{4})\s*[-–—to]+\s*(\w+\s+\d{4}|present|current)',
            re.IGNORECASE,
        )
        for match in date_range_pattern.finditer(text):
            start_str = match.group(1)
            end_str = match.group(2)

            start_date = dateparser.parse(start_str)
            if end_str.lower() in ("present", "current"):
                from datetime import datetime
                end_date = datetime.now()
            else:
                end_date = dateparser.parse(end_str)

            if start_date and end_date:
                months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
                if months > 0:
                    durations.append(float(months))
    except Exception as e:
        logger.warning(f"Duration extraction failed: {e}")

    # Fallback: look for explicit duration mentions
    year_pattern = re.compile(r'(\d+)\s*(?:years?|yrs?)', re.IGNORECASE)
    month_pattern = re.compile(r'(\d+)\s*(?:months?|mos?)', re.IGNORECASE)

    for m in year_pattern.finditer(text):
        durations.append(float(m.group(1)) * 12)
    for m in month_pattern.finditer(text):
        durations.append(float(m.group(1)))

    return durations


def score_skill(
    skill: str,
    sections: Dict[str, str],
    durations: List[float],
) -> Dict:
    """Step 5 & 6 — Score a single skill by section presence and duration boost."""
    base_score = 0.0
    evidence = {"work_experience": 0, "projects": 0, "certifications": 0, "courses": 0}
    source_breakdown = {
        "work_experience_score": 0.0,
        "projects_score": 0.0,
        "certifications_score": 0.0,
        "courses_score": 0.0,
    }

    # Work experience
    exp_count = count_skill_occurrences(skill, sections.get("experience", ""))
    if exp_count > 0:
        evidence["work_experience"] = exp_count
        work_score = exp_count * WORK_EXP_WEIGHT
        source_breakdown["work_experience_score"] = round(work_score, 2)
        base_score += work_score

    # Projects
    projects_text = "\n".join(sections.get("projects", "")) if isinstance(sections.get("projects"), list) else sections.get("projects", "")
    proj_count = count_skill_occurrences(skill, projects_text)
    if proj_count > 0:
        evidence["projects"] = proj_count
        proj_score = proj_count * PROJECTS_WEIGHT
        source_breakdown["projects_score"] = round(proj_score, 2)
        base_score += proj_score

    # Certifications
    cert_text = "\n".join(sections.get("certifications", "")) if isinstance(sections.get("certifications"), list) else sections.get("certifications", "")
    cert_count = count_skill_occurrences(skill, cert_text)
    if cert_count > 0:
        evidence["certifications"] = cert_count
        cert_score = CERTIFICATIONS_WEIGHT
        source_breakdown["certifications_score"] = round(cert_score, 2)
        base_score += cert_score

    # Education / Courses
    edu_text = sections.get("education", "") + " " + sections.get("courses", "")
    edu_count = count_skill_occurrences(skill, edu_text)
    if edu_count > 0:
        evidence["courses"] = edu_count
        edu_score = EDUCATION_WEIGHT
        source_breakdown["courses_score"] = round(edu_score, 2)
        base_score += edu_score

    # Duration boost (Step 6)
    if evidence["work_experience"] > 0 and durations:
        max_duration = max(durations)
        if max_duration > 12:
            base_score *= DURATION_12M_BOOST
        elif max_duration > 6:
            base_score *= DURATION_6M_BOOST

    # Normalize to 0-5 scale
    final_score = min(round(base_score, 2), MAX_SKILL_SCORE)

    return {
        "score": final_score,
        "evidence": evidence,
        "source_breakdown": source_breakdown,
    }


async def parse_resume(file_path: str, student_id: str) -> Dict:
    """Main resume parsing pipeline — runs all 7 steps."""
    from models.student_model import Student, SkillDetail, SkillEvidence, SkillSourceBreakdown, ResumeSections

    try:
        student = await Student.get(PydanticObjectId(student_id))
        if not student:
            raise ValueError(f"Student {student_id} not found")

        # Mark as processing
        student.resume_parse_status = PARSE_PROCESSING
        await student.save()

        # Step 1 — Extract text
        raw_text = extract_text_from_pdf(file_path)
        if not raw_text:
            raise ValueError("No text extracted from PDF")

        # Step 2 — Detect sections
        sections = detect_sections(raw_text)

        # Step 3 & 4 — Extract skills
        all_text = raw_text
        skills = extract_skills_from_text(all_text)

        # Also check the explicit skills section
        if sections.get("skills"):
            # Split by common delimiters
            skill_section_items = re.split(r'[,;|•·\n]+', sections["skills"])
            skill_section_items = [s.strip() for s in skill_section_items if s.strip()]
            extra_skills = normalize_skills(skill_section_items)
            # Merge
            existing_lower = {s.lower() for s in skills}
            for es in extra_skills:
                if es.lower() not in existing_lower:
                    skills.append(es)
                    existing_lower.add(es.lower())

        # Extract durations from experience section
        durations = extract_durations_months(sections.get("experience", ""))

        # Step 5 & 6 — Score each skill
        skill_profile = {}
        for skill in skills:
            scored = score_skill(skill, sections, durations)
            skill_profile[skill] = SkillDetail(
                score=scored["score"],
                evidence=SkillEvidence(**scored["evidence"]),
                source_breakdown=SkillSourceBreakdown(**scored["source_breakdown"]),
            )

        # Parse projects and experience as lists
        projects_list = []
        if sections.get("projects"):
            projects_list = [p.strip() for p in re.split(r'\n{2,}', sections["projects"]) if p.strip()]
            if not projects_list:
                projects_list = [sections["projects"]]

        experience_list = []
        if sections.get("experience"):
            experience_list = [e.strip() for e in re.split(r'\n{2,}', sections["experience"]) if e.strip()]
            if not experience_list:
                experience_list = [sections["experience"]]

        cert_list = []
        if sections.get("certifications"):
            cert_list = [c.strip() for c in re.split(r'\n{2,}', sections["certifications"]) if c.strip()]
            if not cert_list:
                cert_list = [sections["certifications"]]

        # Step 7 — Store in MongoDB
        student.skill_profile = skill_profile
        student.resume_sections = ResumeSections(
            education=sections.get("education", ""),
            projects=projects_list,
            experience=experience_list,
            certifications=cert_list,
            raw_text=raw_text,
        )
        student.resume_parse_status = PARSE_DONE
        await student.save()

        return {
            "status": "done",
            "skills_count": len(skill_profile),
            "skills": list(skill_profile.keys()),
        }

    except Exception as e:
        logger.error(f"Resume parse failed for student {student_id}: {e}")
        try:
            student = await Student.get(PydanticObjectId(student_id))
            if student:
                student.resume_parse_status = PARSE_FAILED
                await student.save()
        except Exception:
            pass
        raise
