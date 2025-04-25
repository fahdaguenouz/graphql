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