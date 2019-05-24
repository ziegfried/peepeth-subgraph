import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const PEEPETH_STATS = gql`
  query peepethStats {
    peepeth(id: "global") {
      numberOfPeeps
      numberOfAccounts
    }
  }
`;

const Stats: React.FC = () => {
  const { data, loading, error } = useQuery(PEEPETH_STATS);

  if (loading) {
    return null;
  }

  if (error) {
    return <strong>ERROR: {error.message}</strong>;
  }

  const { numberOfPeeps, numberOfAccounts } = data.peepeth;
  return (
    <div>
      <strong>{numberOfPeeps}</strong> peeps by <strong>{numberOfAccounts}</strong> accounts
    </div>
  );
};

export default Stats;
