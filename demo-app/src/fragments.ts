import { gql } from 'apollo-boost';

export const AccountInfoFragment = gql`
  fragment AccountInfo on Account {
    id
    name
    realName
    avatarUrl
  }
`;
