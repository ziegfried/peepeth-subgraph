import React from 'react';
import styled from 'styled-components';
import Avatar from './Avatar';

export interface Props {
  id?: string;
  name?: string;
  realName?: string;
  avatarUrl?: string;
}

const AccountBox = styled.div`
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 56px;
`;

const Name = styled.div`
  font-size: 12px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AccountInfo: React.FC<Props> = ({ id, name, realName, avatarUrl }) => {
  let displayName = '...';
  if (name == null) {
    if (id) {
      displayName = id.slice(0, 5) + '...';
    }
  } else {
    displayName = `@${name}`;
  }

  return (
    <AccountBox>
      <Avatar avatarUrl={avatarUrl} />
      <Name>{displayName}</Name>
    </AccountBox>
  );
};

export default AccountInfo;
