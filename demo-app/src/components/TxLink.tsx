import React from 'react';
import styled from 'styled-components';

const Link = styled.a`
  text-decoration: underline;
`;

const truncateTx = (tx: string): string => `${tx.slice(0, 5)}...${tx.slice(-5)}`;

const etherscanUrl = (tx: string): string => `https://etherscan.io/tx/${encodeURIComponent(tx)}`;

export interface Props {
  tx: string;
}

const TxLink: React.FC<Props> = ({ tx }) => (
  <Link href={etherscanUrl(tx)} target="_blank" title="(view on Etherscan)">
    {truncateTx(tx)}
  </Link>
);

export default TxLink;
