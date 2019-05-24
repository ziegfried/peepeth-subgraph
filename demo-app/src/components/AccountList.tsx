import React from 'react';
import Account from './Account';
import FilterInput from './FilterInput';
import FetchMoreButton from './FetchMoreButton';

export interface Props {
  loading?: boolean;
  accounts?: {
    id: string;
    name: string;
    realName?: string;
    avatarUrl?: string;
  }[];
  error?: string;
  filterValue: string;
  onFilterValueChange: (value: string) => void;
  onSelectAccount: (id: string) => void;
  selectedAccount?: string;
  fetchMore: () => void;
  isFetchingMore?: boolean;
}

const AccountList: React.FC<Props> = ({
  loading,
  accounts,
  error,
  filterValue,
  onFilterValueChange,
  onSelectAccount,
  selectedAccount,
  fetchMore,
  isFetchingMore,
}) => {
  return (
    <>
      <FilterInput value={filterValue} onChange={onFilterValueChange} />
      {error ? <strong>ERROR: {error}</strong> : null}
      {accounts
        ? accounts.map(account => (
            <Account
              onClick={() => onSelectAccount(account.id)}
              active={selectedAccount === account.id}
              key={account.id}
              {...account}
            />
          ))
        : null}
      {accounts && accounts.length ? (
        <FetchMoreButton onClick={fetchMore} isFetching={isFetchingMore} />
      ) : null}
    </>
  );
};

export default AccountList;
