import 'server-only'

/**
 * Evaluation Datasets for AI Quality Testing
 *
 * These datasets test matching accuracy and B2C query quality
 * against known-good results (ground truth).
 */

export interface EvalTestCase {
  id: string
  name: string
  description: string
  input: Record<string, unknown>
  expectedOutput: Record<string, unknown>
  tags: string[]
}

// ─── Matching Evaluation Dataset ──────────────────────────────────

export const matchingEvalDataset: EvalTestCase[] = [
  {
    id: 'match-same-major-cs',
    name: 'Same CS Major Students',
    description: 'Two CS students with overlapping interests should score >80',
    input: {
      currentUser: {
        id: 'eval-user-1',
        firstName: 'Minh',
        lastName: 'Nguyen',
        university: 'HCMUT',
        major: 'Computer Science',
        year: 3,
        interests: ['AI', 'Machine Learning', 'Web Development'],
        skills: ['Python', 'JavaScript', 'React'],
        studyGoals: ['Research AI', 'Build projects'],
        preferredStudyTime: ['Tối (19:00-22:00)'],
        languages: ['Vietnamese', 'English'],
        gpa: 3.5,
      },
      candidate: {
        id: 'eval-candidate-1',
        firstName: 'Linh',
        lastName: 'Tran',
        university: 'HCMUT',
        major: 'Computer Science',
        year: 3,
        interests: ['AI', 'Deep Learning', 'Data Science'],
        skills: ['Python', 'TensorFlow', 'SQL'],
        studyGoals: ['Master AI', 'Publish papers'],
        preferredStudyTime: ['Tối (19:00-22:00)'],
        languages: ['Vietnamese', 'English'],
        gpa: 3.7,
      },
    },
    expectedOutput: {
      minScore: 80,
      shouldMatchCriteria: ['major', 'interests', 'preferredStudyTime', 'university'],
    },
    tags: ['matching', 'same-major', 'high-compatibility'],
  },
  {
    id: 'match-different-major',
    name: 'Different Major Students',
    description: 'CS student vs Economics student with no shared interests should score <60',
    input: {
      currentUser: {
        id: 'eval-user-2',
        firstName: 'Duc',
        lastName: 'Pham',
        university: 'HCMUT',
        major: 'Computer Science',
        year: 2,
        interests: ['Programming', 'Gaming', 'Algorithms'],
        skills: ['C++', 'Java', 'Data Structures'],
        studyGoals: ['Competitive programming'],
        preferredStudyTime: ['Đêm (22:00-02:00)'],
        languages: ['Vietnamese'],
        gpa: 3.2,
      },
      candidate: {
        id: 'eval-candidate-2',
        firstName: 'Huong',
        lastName: 'Le',
        university: 'NEU',
        major: 'Economics',
        year: 4,
        interests: ['Finance', 'Marketing', 'Business'],
        skills: ['Excel', 'PowerPoint', 'Statistics'],
        studyGoals: ['MBA preparation'],
        preferredStudyTime: ['Sáng (6:00-12:00)'],
        languages: ['Vietnamese', 'Chinese'],
        gpa: 3.8,
      },
    },
    expectedOutput: {
      maxScore: 60,
      shouldNotMatchCriteria: ['major', 'interests', 'skills', 'preferredStudyTime'],
    },
    tags: ['matching', 'different-major', 'low-compatibility'],
  },
  {
    id: 'match-complementary-skills',
    name: 'Complementary Skills Match',
    description: 'Frontend dev + Backend dev should have moderate-high score',
    input: {
      currentUser: {
        id: 'eval-user-3',
        firstName: 'An',
        lastName: 'Vo',
        university: 'UIT',
        major: 'Software Engineering',
        year: 3,
        interests: ['Web Development', 'UI/UX', 'Startups'],
        skills: ['React', 'CSS', 'Figma', 'TypeScript'],
        studyGoals: ['Build full-stack apps', 'Start a project'],
        preferredStudyTime: ['Chiều (12:00-18:00)', 'Tối (19:00-22:00)'],
        languages: ['Vietnamese', 'English'],
        gpa: 3.4,
      },
      candidate: {
        id: 'eval-candidate-3',
        firstName: 'Bao',
        lastName: 'Hoang',
        university: 'UIT',
        major: 'Software Engineering',
        year: 3,
        interests: ['Backend', 'DevOps', 'System Design'],
        skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
        studyGoals: ['Build scalable systems', 'Start a project'],
        preferredStudyTime: ['Tối (19:00-22:00)', 'Cuối tuần'],
        languages: ['Vietnamese', 'English'],
        gpa: 3.3,
      },
    },
    expectedOutput: {
      minScore: 70,
      shouldMatchCriteria: ['major', 'university', 'studyGoals'],
    },
    tags: ['matching', 'complementary', 'medium-compatibility'],
  },
  {
    id: 'match-schedule-conflict',
    name: 'Schedule Conflict',
    description: 'Same interests but completely different schedules should reduce score',
    input: {
      currentUser: {
        id: 'eval-user-4',
        firstName: 'Chi',
        lastName: 'Dang',
        university: 'FPT',
        major: 'Data Science',
        year: 2,
        interests: ['Machine Learning', 'Statistics', 'Python'],
        skills: ['Python', 'R', 'Pandas'],
        studyGoals: ['Kaggle competitions'],
        preferredStudyTime: ['Sáng (6:00-12:00)'],
        languages: ['Vietnamese', 'English'],
        gpa: 3.6,
      },
      candidate: {
        id: 'eval-candidate-4',
        firstName: 'Dat',
        lastName: 'Bui',
        university: 'FPT',
        major: 'Data Science',
        year: 2,
        interests: ['Machine Learning', 'Deep Learning', 'Computer Vision'],
        skills: ['Python', 'PyTorch', 'OpenCV'],
        studyGoals: ['Kaggle competitions', 'Research'],
        preferredStudyTime: ['Đêm (22:00-02:00)'],
        languages: ['Vietnamese'],
        gpa: 3.4,
      },
    },
    expectedOutput: {
      minScore: 65,
      maxScore: 85,
      note: 'High academic match but schedule conflict should reduce score',
    },
    tags: ['matching', 'schedule-conflict'],
  },
]

// ─── B2C Query Evaluation Dataset ─────────────────────────────────

export const b2cQueryEvalDataset: EvalTestCase[] = [
  {
    id: 'b2c-simple-major',
    name: 'Simple Major Search',
    description: 'Query for CS students should extract major=Computer Science',
    input: {
      query: 'Tìm bạn học ngành Khoa học máy tính',
    },
    expectedOutput: {
      extractedCriteria: {
        major: 'Computer Science',
      },
      minResults: 1,
    },
    tags: ['b2c', 'simple', 'major'],
  },
  {
    id: 'b2c-complex-query',
    name: 'Complex Multi-criteria Query',
    description: 'Complex Vietnamese query should extract multiple criteria',
    input: {
      query: 'Tìm bạn học Python và Machine Learning, học buổi tối, GPA trên 3.0',
    },
    expectedOutput: {
      extractedCriteria: {
        skills: ['Python'],
        interests: ['Machine Learning'],
        preferredStudyTime: ['Tối (19:00-22:00)'],
        gpaMin: 3.0,
      },
      minResults: 1,
    },
    tags: ['b2c', 'complex', 'multi-criteria'],
  },
  {
    id: 'b2c-time-mapping',
    name: 'Vietnamese Time Expression',
    description: 'Vietnamese time expressions should map to standard format',
    input: {
      query: 'Ai học buổi sáng cuối tuần không?',
    },
    expectedOutput: {
      extractedCriteria: {
        preferredStudyTime: ['Sáng (6:00-12:00)', 'Cuối tuần'],
      },
    },
    tags: ['b2c', 'time-mapping', 'vietnamese'],
  },
]

// ─── Evaluation Helpers ───────────────────────────────────────────

export function getDatasetByTag(tag: string): EvalTestCase[] {
  return [
    ...matchingEvalDataset.filter(t => t.tags.includes(tag)),
    ...b2cQueryEvalDataset.filter(t => t.tags.includes(tag)),
  ]
}

export function getAllDatasets(): { matching: EvalTestCase[]; b2c: EvalTestCase[] } {
  return {
    matching: matchingEvalDataset,
    b2c: b2cQueryEvalDataset,
  }
}
