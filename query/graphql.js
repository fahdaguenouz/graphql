export const USER_INFO = /*gql*/`
{
  user {
    firstName
    lastName
  }
}`



export const AUDITS_INFO = /*gql*/`
{
  user {
    auditRatio
    audits_aggregate(where: {closureType: {_eq: succeeded}}) {
      aggregate {
        count
      }
    }
    failed_audits: audits_aggregate(where: {closureType: {_eq: failed}}) {
      aggregate {
        count
      }
    }
  }
}`

export const USER_LEVEL_XP = /*gql*/ `
query getLevelAndXP($arg: String!) {
  user {
    transactions(
      where: {
        type: {_eq: "level"},
        _or: [
          {object: {type: {_eq: "project"}}},
          {object: {type: {_eq: "piscine"}}}
        ]
      }
      order_by: {amount: desc}
      limit: 1
    ) {
      amount
    }
  }
  transaction(
    where: {
      type: {_eq: "xp"},
      _or: [
        {object: {type: {_eq: "project"}}},
        {object: {type: {_eq: "piscine"}}},
        {path: {_ilike: $arg}}
      ]
    }
  ) {
    amount
  }
}
`;



export const XP_PROGRESS_QUERY = `
{
  transaction(
    where: {
      type: {_eq: "xp"},
      _or: [{object: {type: {_eq: "project"}}}, {object: {type: {_eq: "piscine"}}}]
    }
    order_by: {createdAt: asc}
  ) {
    amount
    createdAt
    object {
      name
    }
  }
} 
`;

export const SKILL_QUERY = `
{
  transaction(
    where: {
      type: {_ilike: "%skill%"}
    }
    order_by: {amount: desc}
  ) {
    type
    amount
  }
}
`;

export const PROJECT_COMPLETION_QUERY = `
{
  progress(
    where: {
      isDone: {_eq: true},
      object: {type: {_eq: "project"}}
    }
    order_by: {updatedAt: asc}
  ) {
    object {
      name
      type
    }
    grade
    updatedAt
  }
}
`;