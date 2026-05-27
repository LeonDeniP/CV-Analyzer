const constants = {
  ANALYZE_RESUME_PROMPT: `You are an elite ATS resume reviewer, recruiter, career coach, and HR evaluator.

Your task is to deeply analyze the uploaded resume from both:
- ATS (Applicant Tracking System) perspective
- Real recruiter / hiring manager perspective

IMPORTANT RULES:
- Return ONLY valid JSON
- No markdown
- No explanations outside JSON
- No extra text before or after JSON
- Be highly specific and professional
- Avoid generic feedback
- Base all analysis ONLY on the provided resume
- If information is missing, explain what is missing
- Be strict but fair in scoring

--------------------------------------------------
STEP 1 — VALIDATE DOCUMENT
--------------------------------------------------

First determine whether the uploaded file is actually a resume/CV.

A valid resume usually contains:
- Work experience
- Education
- Skills
- Contact information
- Certifications/projects/organizations (optional)

If the document is NOT a resume, return:

{
  "error": "This document does not appear to be a professional resume or CV. Please upload a resume containing work experience, education, skills, and professional information."
}

--------------------------------------------------
STEP 2 — ANALYZE RESUME
--------------------------------------------------

If the document IS a resume, analyze it thoroughly.

Evaluate:
- ATS compatibility
- Resume structure
- Professionalism
- Keyword optimization
- Achievement impact
- Technical depth
- Clarity and readability
- Hiring potential
- Career positioning
- Recruiter impression

Use strict professional HR standards.

--------------------------------------------------
SCORING RULES
--------------------------------------------------

Score each category from 1-10.

Scoring guideline:
1-3 = Very Weak
4-5 = Below Average
6-7 = Good
8-9 = Excellent
10 = Outstanding / Industry-Level Resume

Be realistic and critical.

--------------------------------------------------
IMPORTANT ATS RULES
--------------------------------------------------

Strong ATS resumes should have:
- Clear section headings
- Simple formatting
- Strong keywords
- Quantified achievements
- Action verbs
- Consistent structure
- Clean readability
- No unnecessary graphics/tables
- Proper technical terminology
- Relevant skills matching target role

--------------------------------------------------
RETURN JSON FORMAT
--------------------------------------------------

{
  "overallScore": "X/10",

  "careerLevel": "Student | Entry Level | Junior | Mid Level | Senior | Lead",

  "candidateStrength": "Weak | Average | Strong | Highly Competitive",

  IMPORTANT:
  - Recommended jobs MUST match the candidate's actual education, experience, and skills
  - Never recommend software engineering jobs unless technical/software skills truly exist
  - Culinary resumes should produce culinary jobs
  - Accounting resumes should produce finance/accounting jobs
  - Design resumes should produce design jobs
  - Medical resumes should produce healthcare jobs
  - Recommendations must be realistic and relevant

  "recommendedJobs": [
    {
      "title": "Frontend Developer",
      "matchPercentage": 85
    },
    {
      "title": "UI Engineer",
      "matchPercentage": 78
    }
  ],

  "salaryEstimate": {
    "junior": "$500-$900/month",
    "midLevel": "$1000-$2000/month"
  },

  "strengths": [
    "Specific strength"
  ],

  "improvements": [
    "Specific improvement"
  ],

  "keywords": [
    "React",
    "Node.js",
    "SQL"
  ],

  "missingKeywords": [
    "Docker",
    "CI/CD"
  ],

  "summary": "Professional overall assessment",

  "recruiterImpression": "How recruiters would likely perceive this candidate",

  "performanceMetrics": {
    "formatting": 0,
    "contentQuality": 0,
    "keywordUsage": 0,
    "atsCompatibility": 0,
    "quantifiableAchievements": 0,
    "professionalImpact": 0,
    "technicalDepth": 0
  },

  "actionItems": [
    "Specific actionable improvement"
  ],

  "proTips": [
    "Professional career advice"
  ],

  "atsChecklist": [
    {
      "item": "Clear section headings",
      "status": true
    },
    {
      "item": "Quantified achievements",
      "status": false
    }
  ],

  "bestSections": [
    "Projects",
    "Skills"
  ],

  "weakestSections": [
    "Professional Summary"
  ],

  "interviewReadiness": {
    "score": 0,
    "assessment": "Short explanation"
  },

  "careerSuggestions": [
    "Learn Docker and CI/CD to improve backend competitiveness",
    "Add measurable project outcomes"
  ]
}

--------------------------------------------------
ANALYSIS QUALITY RULES
--------------------------------------------------

Your feedback MUST:
- Be highly specific
- Mention real weaknesses
- Mention real strengths
- Avoid vague corporate language
- Avoid repeating the same point
- Sound like an experienced recruiter
- Focus on employability
- Focus on competitiveness
- Focus on ATS success
- Focus on hiring potential

--------------------------------------------------
RESUME TEXT
--------------------------------------------------

{{DOCUMENT_TEXT}}`,
};

export const METRIC_CONFIG = [
  {
    key: "formatting",
    label: "Formatting",
    defaultValue: 7,
    colorClass: "from-emerald-400 to-emerald-500",
    shadowClass: "group-hover/item:shadow-emerald-500/30",
    icon: "🎨",
  },
  {
    key: "contentQuality",
    label: "Content Quality",
    defaultValue: 6,
    colorClass: "from-blue-400 to-blue-500",
    shadowClass: "group-hover/item:shadow-blue-500/30",
    icon: "📝",
  },
  {
    key: "atsCompatibility",
    label: "ATS Compatibility",
    defaultValue: 6,
    colorClass: "from-violet-400 to-violet-500",
    shadowClass: "group-hover/item:shadow-violet-500/30",
    icon: "🤖",
  },
  {
    key: "keywordUsage",
    label: "Keyword Usage",
    defaultValue: 5,
    colorClass: "from-purple-400 to-purple-500",
    shadowClass: "group-hover/item:shadow-purple-500/30",
    icon: "🔍",
  },
  {
    key: "quantifiableAchievements",
    label: "Quantified Results",
    defaultValue: 4,
    colorClass: "from-orange-400 to-orange-500",
    shadowClass: "group-hover/item:shadow-orange-500/30",
    icon: "📊",
  },
];

export const buildPresenceChecklist = (text) => {
  const hay = (text || "").toLowerCase();
  return [
    {
      label: "Standard Section Headings",
      present:
        /experience|education|skills|summary|objective|work history|professional experience|employment/.test(
          hay
        ),
    },
    {
      label: "Contact Information",
      present: /email|phone|linkedin|github|portfolio|@|\.com|\.net|\.org/.test(
        hay
      ),
    },
    {
      label: "Keywords & Skills",
      present:
        /skills|technologies|tech skills|competencies|programming|software|tools|javascript|python|java|react|node|sql|html|css|aws|docker|kubernetes|agile|scrum|git|api|database|framework|library|language|technology|stack/.test(
          hay
        ),
    },
    {
      label: "Quantified Achievements",
      present:
        /\d+%|\d+ percent|\d+ people|\d+ team|\d+ project|\d+ year|\d+ month|\d+ dollar|\$\d+|\d+ users|\d+ customers|\d+ revenue|\d+ growth|\d+ improvement|\d+ reduction|\d+ increase|\d+ decrease/.test(
          hay
        ),
    },
    {
      label: "Action Verbs",
      present:
        /developed|created|implemented|managed|led|designed|built|improved|increased|decreased|achieved|delivered|launched|optimized|streamlined|enhanced|established|coordinated|facilitated|orchestrated|spearheaded|pioneered|architected|engineered|deployed|maintained|supported|troubleshot|resolved|analyzed|researched|evaluated|assessed|planned|organized|executed|completed|finished|accomplished|generated|produced|created|developed|built|constructed|assembled|fabricated|manufactured|produced|yielded|resulted|caused|brought|about|led|to|contributed|to|helped|assisted|aided|supported|enabled|empowered|facilitated|promoted|encouraged|fostered|nurtured|cultivated|developed|grew|expanded|scaled|increased|boosted|enhanced|improved|upgraded|refined|polished|perfected|optimized|streamlined|simplified|clarified|organized|structured|arranged|systematized|standardized|formalized|institutionalized|established|founded|created|initiated|started|began|commenced|launched|introduced|unveiled|revealed|disclosed|announced|declared|proclaimed|stated|expressed|communicated|conveyed|transmitted|delivered|presented|demonstrated|exhibited|displayed|showcased|highlighted|emphasized|stressed|underscored|accentuated|featured|spotlighted|focused|centered|concentrated|targeted|aimed|directed|guided|steered|navigated|piloted|drove|propelled|pushed|advanced|progressed|moved|forward|accelerated|expedited|hastened|rushed|hurried|sped|up|quickened|fastened|accelerated|boosted|enhanced|amplified|magnified|multiplied|doubled|tripled|quadrupled|quintupled|sextupled|septupled|octupled|nonupled|decupled/.test(
          hay
        ),
    },
    {
      label: "Professional Experience",
      present:
        /experience|employment|work history|professional experience|job|position|role|career|occupation|employment|work|job|position|role|title|responsibilities|duties|tasks|projects|initiatives|achievements|accomplishments|contributions|impact|results|outcomes|deliverables|outputs|work|employment|job|position|role|title|company|organization|employer|client|customer|stakeholder|team|department|division|unit|group|section|branch|office|location|site|facility|premises|workplace|workstation|desk|office|cubicle|workspace|environment|setting|context|situation|circumstance|condition|state|status|level|grade|rank|tier|category|class|type|kind|sort|variety|form|style|manner|way|method|approach|technique|strategy|tactic|procedure|process|system|framework|model|paradigm|theory|concept|idea|notion|thought|belief|opinion|view|perspective|standpoint|position|stance|attitude|mindset|outlook|approach|methodology|philosophy|principle|value|standard|criterion|benchmark|measure|metric|indicator|signal|sign|mark|token|symbol|emblem|badge|insignia|logo|brand|label|tag|stamp|seal|signature|autograph|mark|trace|track|trail|path|route|way|road|street|avenue|boulevard|highway|freeway|expressway|turnpike|parkway|drive|lane|alley|path|trail|track|route|way|road|street|avenue|boulevard|highway|freeway|expressway|turnpike|parkway|drive|lane|alley/.test(
          hay
        ),
    },
    {
      label: "Education Section",
      present:
        /education|bachelor|master|phd|university|degree|college|school|academic|academy|institute|institution|faculty|department|program|course|curriculum|syllabus|textbook|lecture|seminar|workshop|tutorial|training|certification|certificate|diploma|transcript|gpa|grade|score|mark|result|outcome|achievement|accomplishment|success|performance|progress|development|growth|improvement|enhancement|advancement|promotion|elevation|upgrade|boost|lift|raise|increase|improvement|enhancement|betterment|refinement|polishing|perfection|optimization|streamlining|simplification|clarification|organization|structuring|arrangement|systematization|standardization|formalization|institutionalization|establishment|foundation|creation|initiation|start|beginning|commencement|launch|introduction|unveiling|revelation|disclosure|announcement|declaration|proclamation|statement|expression|communication|conveyance|transmission|delivery|presentation|demonstration|exhibition|display|showcase|highlighting|emphasis|stress|underscoring|accentuation|featuring|spotlighting|focusing|centering|concentration|targeting|aiming|directing|guiding|steering|navigating|piloting|driving|propelling|pushing|advancing|progressing|moving|forward|accelerating|expediting|hastening|rushing|hurrying|speeding|up|quickening|fastening|accelerating|boosting|enhancing|amplifying|magnifying|multiplying|doubling|tripling|quadrupling|quintupling|sextupling|septupling|octupling|nonupling|decupling/.test(
          hay
        ),
    },
  ];
};

export default constants;
