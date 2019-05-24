import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import AccountInfo from '../components/AccountInfo';
import Spinner from '../components/Spinner';
import FollowerList, { Item } from '../components/FollowerList';
import { AccountInfoFragment } from '../fragments';
import Message from '../components/Message';

const ACCOUNT_FOLLOWERS = gql`
  query accountFollowers($account: String!) {
    account(id: $account) {
      id
      followers(first: 6) {
        account {
          ...AccountInfo
        }
      }
    }
  }
  ${AccountInfoFragment}
`;

interface Account {
  id: string;
  name: string;
  realName?: string;
  avatarUrl?: string;
}

export interface Props {
  account: string;
}

const Followers: React.FC<Props> = ({ account }) => {
  const { data, loading, error } = useQuery(ACCOUNT_FOLLOWERS, { variables: { account } });

  if (loading) {
    return (
      <FollowerList title="Followers">
        <Spinner />
      </FollowerList>
    );
  }

  if (error) {
    return (
      <FollowerList title="Followers">
        <Message text="Failed to fetch followers" />
      </FollowerList>
    );
  }

  if (data.account.followers.length === 0) {
    return (
      <FollowerList title="Followers">
        <Message text="No followers" />
      </FollowerList>
    );
  }

  return (
    <FollowerList title="Followers">
      {data.account.followers.map((f: { account: Account }) => (
        <Item key={f.account.id}>
          <AccountInfo id={f.account.id} name={f.account.name} avatarUrl={f.account.avatarUrl} />
        </Item>
      ))}
    </FollowerList>
  );
};

export default Followers;
