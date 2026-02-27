"""Skill name normalization utilities."""

# Mapping of common abbreviations and aliases to canonical skill names
SKILL_ALIASES = {
    # Programming Languages
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "rb": "Ruby",
    "ruby": "Ruby",
    "c#": "C#",
    "csharp": "C#",
    "c++": "C++",
    "cpp": "C++",
    "golang": "Go",
    "go": "Go",
    "kt": "Kotlin",
    "kotlin": "Kotlin",
    "rs": "Rust",
    "rust": "Rust",

    # Frameworks & Libraries
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "angular": "Angular",
    "angularjs": "Angular",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "express": "Express.js",
    "expressjs": "Express.js",
    "django": "Django",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "springboot": "Spring Boot",

    # Databases
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "mysql": "MySQL",
    "redis": "Redis",
    "sqlite": "SQLite",
    "dynamodb": "DynamoDB",
    "cassandra": "Cassandra",
    "elasticsearch": "Elasticsearch",

    # Cloud & DevOps
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "Google Cloud",
    "google cloud": "Google Cloud",
    "azure": "Azure",
    "docker": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "terraform": "Terraform",
    "jenkins": "Jenkins",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "github actions": "GitHub Actions",
    "gitlab ci": "GitLab CI",

    # Data Science / ML
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "dl": "Deep Learning",
    "deep learning": "Deep Learning",
    "ai": "Artificial Intelligence",
    "artificial intelligence": "Artificial Intelligence",
    "nlp": "Natural Language Processing",
    "natural language processing": "Natural Language Processing",
    "cv": "Computer Vision",
    "computer vision": "Computer Vision",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "pytorch": "PyTorch",
    "torch": "PyTorch",
    "scikit-learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "keras": "Keras",

    # Tools & Misc
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "linux": "Linux",
    "bash": "Bash",
    "shell": "Shell Scripting",
    "rest": "REST APIs",
    "rest api": "REST APIs",
    "restful": "REST APIs",
    "graphql": "GraphQL",
    "html": "HTML",
    "html5": "HTML",
    "css": "CSS",
    "css3": "CSS",
    "sass": "SASS",
    "scss": "SASS",
    "tailwind": "TailwindCSS",
    "tailwindcss": "TailwindCSS",
    "figma": "Figma",
    "jira": "Jira",
    "agile": "Agile",
    "scrum": "Scrum",
}


def normalize_skill(skill_name: str) -> str:
    """Normalize a skill name to its canonical form."""
    lower = skill_name.strip().lower()
    return SKILL_ALIASES.get(lower, skill_name.strip().title())


def normalize_skills(skills: list) -> list:
    """Normalize a list of skill names, removing duplicates."""
    seen = set()
    normalized = []
    for s in skills:
        n = normalize_skill(s)
        if n.lower() not in seen:
            seen.add(n.lower())
            normalized.append(n)
    return normalized
