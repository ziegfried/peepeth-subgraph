import React from 'react';
import styled from 'styled-components';

const Ct = styled.div`
  margin: 10px 0;
`;

const List = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  min-height: 66px;
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 11px;
  margin-bottom: 5px;
`;

const ItemCt = styled.div`
  padding-bottom: 10px;
`;

export const Item: React.FC = ({ children }) => <ItemCt>{children}</ItemCt>;

export interface Props {
  title: string;
}

const FollowerList: React.FC<Props> = ({ title, children }) => (
  <Ct>
    <Title>{title}</Title>
    <List>{children}</List>
  </Ct>
);

export default FollowerList;
