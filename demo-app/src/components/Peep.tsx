import React from 'react';
import styled from 'styled-components';
import { distanceInWordsToNow } from 'date-fns';
import AccountInfo, { Props as AccountProps } from './AccountInfo';
import Card from './Card';
import TxLink from './TxLink';

const PeepBox = styled.div`
  padding: 5px;
  margin-bottom: 5px;
`;

const Layout = styled.div`
  display: flex;
`;

const AccountWrapper = styled.div`
  width: 70px;
  margin-right: 10px;
  align-self: center;
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 10px 0 20px;
`;

const PeepText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 130%;
  color: #333;
  padding: 5px;
  flex: 1;
`;

const AdditionalInfo = styled.div`
  font-size: 11px;
  color: rgba(0, 0, 0, 0.5);
  padding: 0 5px 5px 5px;
`;

interface BasePeep {
  timestamp: number;
  content: string;
  account: AccountProps;
  createdInTx: string;
}

export interface Props extends BasePeep {
  replyTo?: BasePeep;
  share?: BasePeep;
}

const Peep: React.FC<Props> = ({ content, timestamp, account, createdInTx }) => (
  <Card width={550}>
    <PeepBox>
      <Layout>
        <AccountWrapper>
          <AccountInfo {...account} />
        </AccountWrapper>
        <Main>
          <PeepText>{content}</PeepText>
          <AdditionalInfo>
            {distanceInWordsToNow(new Date(timestamp * 1000), { addSuffix: true })} &bull;{' '}
            <TxLink tx={createdInTx} />
          </AdditionalInfo>
        </Main>
      </Layout>
    </PeepBox>
  </Card>
);

export default Peep;
