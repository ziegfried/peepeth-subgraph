import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import AccountInfo from '../components/AccountInfo';
import Spinner from '../components/Spinner';
import FollowerList, { Item } from '../components/FollowerList';
import { AccountInfoFragment } from '../fragments';
import Message from '../components/Message';

const ACCOUNT_FOLLOWING = gql`
  query accountFollowing($account: String!) {
    account(id: $account) {
      id
      following(first: 6) {
        followee {
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

const Following: React.FC<Props> = ({ account }) => {
  const { data, loading, error } = useQuery(ACCOUNT_FOLLOWING, { variables: { account } });

  if (loading) {
    return (
      <FollowerList title="Following">
        <Spinner />
      </FollowerList>
    );
  }

  if (error) {
    return (
      <FollowerList title="Following">
        <Message text="Failed to fetch followers" />
      </FollowerList>
    );
  }

  if (data.account.following.length === 0) {
    return (
      <FollowerList title="Following">
        <Message text="Not following anybody" />
      </FollowerList>
    );
  }

  return (
    <FollowerList title="Following">
      {data.account.following.map((f: { followee: Account }) => (
        <Item key={f.followee.id}>
          <AccountInfo id={f.followee.id} name={f.followee.name} avatarUrl={f.followee.avatarUrl} />
        </Item>
      ))}
    </FollowerList>
  );
};

export default Following;
