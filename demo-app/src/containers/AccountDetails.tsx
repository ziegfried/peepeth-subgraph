import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import AccountDetailsInfo from '../components/AccountDetails';
import { AccountInfoFragment } from '../fragments';
import Followers from './Followers';
import Following from './Following';
import Peeps from './Peeps';

const ACCOUNT_DETAILS = gql`
  query accountDetails($account: String!) {
    account(id: $account) {
      ...AccountInfo
      number
      createdInTx
      createdTimestamp
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

const AccountDetails: React.FC<Props> = ({ account }) => {
  const { data, loading, error } = useQuery(ACCOUNT_DETAILS, { variables: { account } });

  if (loading) {
    return null;
  }

  if (error) {
    return <strong>ERROR: {error.message}</strong>;
  }

  return (
    <>
      <AccountDetailsInfo {...data.account} />
      <Followers account={account} />
      <Following account={account} />
      <Peeps account={account} />
    </>
  );
};

export default AccountDetails;
