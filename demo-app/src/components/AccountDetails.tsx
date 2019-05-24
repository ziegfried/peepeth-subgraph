import React from 'react';
import styled from 'styled-components';
import Avatar from './Avatar';
import TxLink from './TxLink';
import { distanceInWordsToNow } from 'date-fns';

const Ct = styled.div`
  margin: 0;
  padding: 15px 5px;
  display: flex;
  flex-direction: row;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
`;

const TopLeft = styled.div``;
const TopRight = styled.div`
  padding: 0 25px;
`;

const NameHeader = styled.h3`
  margin: 0;
  padding: 0;
`;

const FullName = styled.h5`
  margin: 0;
  padding: 0;
`;

const Number = styled.div`
  text-align: center;
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
`;

const CreateInfo = styled.div`
  color: rgba(0, 0, 0, 0.6);
  font-size: 11px;
`;

export interface Props {
  realName?: string;
  number?: number;
  location?: string;
  name: string;
  id: string;
  avatarUrl?: string;
  createdInTx?: string;
  createdTimestamp?: number;
}

const AccountDetails: React.FC<Props> = ({
  id,
  name,
  number,
  realName,
  avatarUrl,
  location,
  createdInTx,
  createdTimestamp,
}) => {
  return (
    <Ct>
      <Top>
        <TopLeft>
          <Avatar avatarUrl={avatarUrl} size="medium" />
          <Number>#{number}</Number>
        </TopLeft>
        <TopRight>
          <NameHeader>@{name}</NameHeader>
          {realName ? <FullName>{realName}</FullName> : null}
          {createdTimestamp && createdInTx ? (
            <CreateInfo>
              Created {distanceInWordsToNow(new Date(createdTimestamp * 1000))} in transaction{' '}
              <TxLink tx={createdInTx} />
            </CreateInfo>
          ) : null}
        </TopRight>
      </Top>
    </Ct>
  );
};

export default AccountDetails;
