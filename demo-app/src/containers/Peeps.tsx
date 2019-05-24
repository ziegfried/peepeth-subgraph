import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import PeepCard from '../components/Peep';
import PeepList from '../components/PeepList';
import { AccountInfoFragment } from '../fragments';

const ACCOUNT_PEEPS = gql`
  query accountPeeps($account: String!) {
    account(id: $account) {
      id
      peeps(first: 10) {
        id
        ...PeepInfo
        replyTo {
          ...PeepInfo
        }
        share {
          ...PeepInfo
        }
      }
    }
  }

  fragment PeepInfo on Peep {
    id
    number
    content
    timestamp
    createdInTx
    account {
      ...AccountInfo
    }
  }
  ${AccountInfoFragment}
`;

interface Peep {
  number: number;
  content: string;
  timestamp: number;
  createdInTx: string;
  account: Account;
  replyTo?: Peep;
  share?: Peep;
}

export interface Props {
  account: string;
}

const Peeps: React.FC<Props> = ({ account }) => {
  const { data, loading, error } = useQuery(ACCOUNT_PEEPS, { variables: { account } });

  let msg: string | undefined = undefined;

  const peepList: Peep[] = (data && data.account && data.account.peeps) || null;

  if (peepList && !peepList.length) {
    msg = `Nothin peep'd yet`;
  }

  if (error) {
    msg = error.message;
  }

  return (
    <PeepList loading={loading} message={msg}>
      {peepList
        ? peepList.map((p: Peep) => (
            <PeepCard
              key={p.number}
              content={p.content}
              timestamp={p.timestamp}
              account={p.account}
              createdInTx={p.createdInTx}
            />
          ))
        : null}
    </PeepList>
  );
};

export default Peeps;
