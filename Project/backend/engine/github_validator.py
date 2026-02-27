"""
GitHub Project Validator Engine
Validates GitHub repositories and cross-references claimed skills
against actual repo languages, topics, and metadata.
"""
import re
import httpx
from typing import Optional

# GitHub API base URL
GITHUB_API = "https://api.github.com"

# Mapping of common skill names to GitHub language names / topics
SKILL_TO_LANGUAGES = {
    "python": ["python"],
    "javascript": ["javascript"],
    "typescript": ["typescript"],
    "java": ["java"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "csharp"],
    "c": ["c"],
    "go": ["go"],
    "rust": ["rust"],
    "ruby": ["ruby"],
    "php": ["php"],
    "swift": ["swift"],
    "kotlin": ["kotlin"],
    "r": ["r"],
    "sql": ["sql", "plpgsql", "tsql"],
    "html": ["html"],
    "css": ["css", "scss", "less"],
    "shell": ["shell", "bash"],
    "dart": ["dart"],
    "scala": ["scala"],
    "lua": ["lua"],

    # Frameworks / Libraries → mapped to their underlying language + topic keywords
    "react": ["javascript", "typescript"],
    "angular": ["typescript", "javascript"],
    "vue": ["javascript", "typescript"],
    "next.js": ["javascript", "typescript"],
    "node.js": ["javascript", "typescript"],
    "express": ["javascript", "typescript"],
    "django": ["python"],
    "flask": ["python"],
    "fastapi": ["python"],
    "spring": ["java"],
    "rails": ["ruby"],
    "laravel": ["php"],
    ".net": ["c#"],

    # Data / ML
    "machine learning": ["python", "jupyter notebook"],
    "deep learning": ["python", "jupyter notebook"],
    "tensorflow": ["python", "c++"],
    "pytorch": ["python"],
    "pandas": ["python"],
    "numpy": ["python"],
    "scikit-learn": ["python"],
    "opencv": ["python", "c++"],
    "nlp": ["python"],
    "data science": ["python", "jupyter notebook", "r"],
    "statistics": ["python", "r", "jupyter notebook"],
    "tableau": [],  # Not a code language

    # DevOps / Cloud
    "docker": [],
    "kubernetes": [],
    "aws": [],
    "azure": [],
    "gcp": [],
    "terraform": ["hcl"],
    "ci/cd": [],

    # Databases
    "mongodb": ["javascript", "python"],
    "postgresql": ["sql", "plpgsql"],
    "mysql": ["sql"],
    "redis": [],
    "firebase": ["javascript", "typescript"],

    # Tools
    "git": [],
    "linux": ["shell"],
    "graphql": ["javascript", "typescript"],
}

# Topic keywords to match against GitHub repo topics
SKILL_TO_TOPICS = {
    "react": ["react", "reactjs", "react-native"],
    "angular": ["angular", "angularjs"],
    "vue": ["vue", "vuejs", "vue3"],
    "next.js": ["nextjs", "next"],
    "node.js": ["nodejs", "node"],
    "express": ["express", "expressjs"],
    "django": ["django"],
    "flask": ["flask"],
    "fastapi": ["fastapi"],
    "machine learning": ["machine-learning", "ml", "deep-learning", "ai"],
    "deep learning": ["deep-learning", "neural-network", "ai"],
    "tensorflow": ["tensorflow", "tf"],
    "pytorch": ["pytorch"],
    "docker": ["docker", "dockerfile", "container"],
    "kubernetes": ["kubernetes", "k8s"],
    "aws": ["aws", "amazon-web-services"],
    "mongodb": ["mongodb", "mongoose"],
    "graphql": ["graphql"],
    "nlp": ["nlp", "natural-language-processing"],
    "data science": ["data-science", "datascience", "data-analysis"],
    "firebase": ["firebase"],
    "ci/cd": ["ci-cd", "cicd", "github-actions", "ci"],
}


def parse_github_url(url: str) -> Optional[str]:
    """
    Extract 'owner/repo' from various GitHub URL formats.
    Returns None if URL is not a valid GitHub repo URL.
    """
    if not url:
        return None

    url = url.strip().rstrip("/")

    # Patterns: https://github.com/owner/repo, github.com/owner/repo, etc.
    patterns = [
        r"(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+)",
    ]

    for pattern in patterns:
        match = re.match(pattern, url)
        if match:
            repo_path = match.group(1)
            # Remove trailing .git if present
            repo_path = repo_path.rstrip("/").removesuffix(".git")
            # Remove any extra path segments (e.g. /tree/main/...)
            parts = repo_path.split("/")
            if len(parts) >= 2:
                return f"{parts[0]}/{parts[1]}"

    return None


async def fetch_repo_info(owner_repo: str) -> dict:
    """Fetch repository metadata from GitHub API."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "SkillNova-Validator/1.0"
        }

        # Fetch repo details
        repo_resp = await client.get(
            f"{GITHUB_API}/repos/{owner_repo}",
            headers=headers
        )

        if repo_resp.status_code == 404:
            return {"error": "Repository not found", "status_code": 404}
        if repo_resp.status_code == 403:
            return {"error": "API rate limit exceeded. Try again later.", "status_code": 403}
        if repo_resp.status_code != 200:
            return {"error": f"GitHub API error: {repo_resp.status_code}", "status_code": repo_resp.status_code}

        repo_data = repo_resp.json()

        # Fetch languages
        lang_resp = await client.get(
            f"{GITHUB_API}/repos/{owner_repo}/languages",
            headers=headers
        )
        languages = lang_resp.json() if lang_resp.status_code == 200 else {}

        # Calculate language percentages
        total_bytes = sum(languages.values()) if languages else 0
        language_percentages = {}
        if total_bytes > 0:
            for lang, bytes_count in languages.items():
                pct = round((bytes_count / total_bytes) * 100, 1)
                if pct >= 0.5:  # Only include languages with >= 0.5%
                    language_percentages[lang] = pct

        return {
            "name": repo_data.get("name", ""),
            "full_name": repo_data.get("full_name", ""),
            "description": repo_data.get("description", ""),
            "html_url": repo_data.get("html_url", ""),
            "stars": repo_data.get("stargazers_count", 0),
            "forks": repo_data.get("forks_count", 0),
            "open_issues": repo_data.get("open_issues_count", 0),
            "size_kb": repo_data.get("size", 0),
            "default_branch": repo_data.get("default_branch", "main"),
            "created_at": repo_data.get("created_at", ""),
            "updated_at": repo_data.get("updated_at", ""),
            "pushed_at": repo_data.get("pushed_at", ""),
            "topics": repo_data.get("topics", []),
            "license": repo_data.get("license", {}).get("spdx_id") if repo_data.get("license") else None,
            "is_fork": repo_data.get("fork", False),
            "languages": languages,
            "language_percentages": language_percentages,
            "primary_language": repo_data.get("language", ""),
        }


def cross_reference_skills(
    claimed_skills: list[str],
    repo_languages: dict,
    repo_topics: list[str],
    primary_language: str = ""
) -> dict:
    """
    Cross-reference claimed skills against actual repo languages and topics.
    Returns per-skill match results + overall confidence.
    """
    repo_lang_lower = {lang.lower(): pct for lang, pct in repo_languages.items()}
    repo_topics_lower = [t.lower() for t in repo_topics]

    # Add primary language
    if primary_language:
        repo_lang_lower.setdefault(primary_language.lower(), 0)

    matches = []
    matched_count = 0
    unverifiable_count = 0

    for skill in claimed_skills:
        skill_lower = skill.lower().strip()
        result = {
            "skill": skill,
            "status": "not_found",   # verified, partial, not_found, unverifiable
            "evidence": []
        }

        # Check against language mapping
        expected_langs = SKILL_TO_LANGUAGES.get(skill_lower, [])
        expected_topics = SKILL_TO_TOPICS.get(skill_lower, [])

        # If no mapping exists, try direct language match
        if not expected_langs and not expected_topics:
            # Try direct match against repo languages
            if skill_lower in repo_lang_lower:
                result["status"] = "verified"
                result["evidence"].append(f"Found as repo language ({repo_lang_lower[skill_lower]:.1f}%)")
                matched_count += 1
            # Try direct match against topics
            elif skill_lower.replace(" ", "-") in repo_topics_lower or skill_lower in repo_topics_lower:
                result["status"] = "verified"
                result["evidence"].append(f"Found in repo topics")
                matched_count += 1
            else:
                # The skill may be a tool/concept that doesn't show in code (Docker, AWS, etc.)
                result["status"] = "unverifiable"
                result["evidence"].append("Cannot verify via code analysis (tool/platform/concept)")
                unverifiable_count += 1
        else:
            lang_found = False
            topic_found = False

            # Check language match
            for expected in expected_langs:
                if expected.lower() in repo_lang_lower:
                    lang_found = True
                    pct = repo_lang_lower[expected.lower()]
                    result["evidence"].append(f"{expected} detected in repo ({pct:.1f}%)")

            # Check topic match
            for expected in expected_topics:
                if expected.lower() in repo_topics_lower:
                    topic_found = True
                    result["evidence"].append(f"'{expected}' found in repo topics")

            if lang_found and topic_found:
                result["status"] = "verified"
                matched_count += 1
            elif lang_found or topic_found:
                result["status"] = "verified"
                matched_count += 1
            elif not expected_langs:
                # Skills that don't map to languages (Docker, AWS, etc.)
                result["status"] = "unverifiable"
                result["evidence"].append("Cannot verify via code analysis (tool/platform)")
                unverifiable_count += 1
            else:
                result["status"] = "not_found"
                result["evidence"].append(f"Expected languages ({', '.join(expected_langs)}) not found in repo")

        matches.append(result)

    # Calculate confidence score
    verifiable_count = len(claimed_skills) - unverifiable_count
    if verifiable_count > 0:
        confidence = round((matched_count / verifiable_count) * 100, 1)
    else:
        confidence = 100.0 if len(claimed_skills) > 0 else 0.0

    verified_skills = [m["skill"] for m in matches if m["status"] == "verified"]
    unmatched_skills = [m["skill"] for m in matches if m["status"] == "not_found"]
    unverifiable_skills = [m["skill"] for m in matches if m["status"] == "unverifiable"]

    return {
        "matches": matches,
        "verified_skills": verified_skills,
        "unmatched_skills": unmatched_skills,
        "unverifiable_skills": unverifiable_skills,
        "confidence_score": confidence,
        "total_claimed": len(claimed_skills),
        "total_verified": matched_count,
        "total_unmatched": len(unmatched_skills),
        "total_unverifiable": unverifiable_count,
    }


async def validate_github_project(github_url: str, claimed_skills: list[str]) -> dict:
    """
    Main validation function.
    Takes a GitHub repo URL and claimed skills, returns full validation report.
    """
    # Parse URL
    owner_repo = parse_github_url(github_url)
    if not owner_repo:
        return {
            "is_valid": False,
            "status": "invalid",
            "message": "Invalid GitHub URL. Please provide a valid GitHub repository URL (e.g. https://github.com/owner/repo).",
            "repo_info": None,
            "skill_analysis": None,
        }

    # Fetch repo info
    repo_info = await fetch_repo_info(owner_repo)

    if "error" in repo_info:
        return {
            "is_valid": False,
            "status": "invalid",
            "message": repo_info["error"],
            "repo_info": None,
            "skill_analysis": None,
        }

    # Cross-reference skills
    skill_analysis = cross_reference_skills(
        claimed_skills=claimed_skills,
        repo_languages=repo_info.get("language_percentages", {}),
        repo_topics=repo_info.get("topics", []),
        primary_language=repo_info.get("primary_language", ""),
    )

    # Determine overall status
    confidence = skill_analysis["confidence_score"]
    if confidence >= 70:
        status = "verified"
        message = f"Project verified! {skill_analysis['total_verified']}/{skill_analysis['total_claimed']} skills confirmed ({confidence}% confidence)."
    elif confidence >= 40:
        status = "partial"
        message = f"Partial match. {skill_analysis['total_verified']}/{skill_analysis['total_claimed']} skills confirmed ({confidence}% confidence). Some claimed skills were not detected."
    else:
        status = "mismatch"
        message = f"Low match. Only {skill_analysis['total_verified']}/{skill_analysis['total_claimed']} skills confirmed ({confidence}% confidence). Most claimed skills were not detected in this repo."

    # Warning for forked repos
    if repo_info.get("is_fork"):
        message += " ⚠️ Note: This is a forked repository."

    return {
        "is_valid": True,
        "status": status,
        "message": message,
        "repo_info": {
            "name": repo_info["name"],
            "full_name": repo_info["full_name"],
            "description": repo_info["description"],
            "html_url": repo_info["html_url"],
            "stars": repo_info["stars"],
            "forks": repo_info["forks"],
            "size_kb": repo_info["size_kb"],
            "primary_language": repo_info["primary_language"],
            "languages": repo_info["language_percentages"],
            "topics": repo_info["topics"],
            "is_fork": repo_info["is_fork"],
            "updated_at": repo_info["updated_at"],
            "license": repo_info["license"],
        },
        "skill_analysis": skill_analysis,
    }
