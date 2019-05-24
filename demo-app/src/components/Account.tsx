import React from 'react';
import styled from 'styled-components';
import AccountInfo, { Props as AccountInfoProps } from './AccountInfo';
import { Clickable as Card } from './Card';

const AccountBox = styled.div`
  margin: 0;
  padding: 15px 5px;
  display: flex;
  flex-direction: row;
`;

const Details = styled.div`
  margin-left: 1px;
`;

const Name = styled.div``;
const Location = styled.div`
  font-size: 12px;
`;
const Address = styled.div`
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
`;

const Left = styled.div`
  width: 100px;
`;

export interface Props extends AccountInfoProps {
  realName?: string;
  number?: number;
  location?: string;
  onClick?: () => void;
  active?: boolean;
}

const Account: React.FC<Props> = ({ id, name, realName, avatarUrl, location, onClick, active }) => {
  return (
    <Card width={450} onClick={onClick} active={active}>
      <AccountBox>
        <Left>
          <AccountInfo id={id} name={name} avatarUrl={avatarUrl} />
        </Left>
        <Details>
          <Name>{realName}</Name>
          <Location>{location}</Location>
          <Address>{id}</Address>
        </Details>
      </AccountBox>
    </Card>
  );
};

export default Account;
