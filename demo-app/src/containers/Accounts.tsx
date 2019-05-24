import { useQuery } from '@apollo/react-hooks';
import { gql, NetworkStatus } from 'apollo-boost';
import React, { useState } from 'react';
import AccountList from '../components/AccountList';

const ACCOUNTS = gql`
  query accounts($name: String, $offset: Int!) {
    accounts(
      first: 10
      skip: $offset
      orderBy: number
      orderDirection: asc
      where: { name_starts_with: $name }
    ) {
      id
      name
      realName
      avatarUrl
      number
      location
    }
  }
`;

interface Account {
  id: string;
  name: string;
  realName?: string;
  avatarUrl?: string;
}

export interface Props {
  onSelectAccount: (id: string) => void;
  selectedAccount: string | null;
}

const Accounts: React.FC<Props> = ({ selectedAccount, onSelectAccount }) => {
  const [nameFilter, updateNameFilter] = useState('');
  const { data, loading, error, fetchMore, networkStatus } = useQuery(ACCOUNTS, {
    variables: { name: nameFilter, offset: 0 },
  });

  return (
    <AccountList
      filterValue={nameFilter}
      onFilterValueChange={updateNameFilter}
      accounts={data ? data.accounts || [] : []}
      loading={loading}
      error={error ? error.message : undefined}
      onSelectAccount={onSelectAccount}
      selectedAccount={selectedAccount || undefined}
      fetchMore={() =>
        fetchMore({
          variables: { offset: data.accounts.length },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return Object.assign({}, prev, {
              accounts: [...prev.accounts, ...fetchMoreResult.accounts],
            });
          },
        })
      }
      isFetchingMore={networkStatus === NetworkStatus.fetchMore}
    />
  );
};

export default Accounts;
