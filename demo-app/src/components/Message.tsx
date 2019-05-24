import React from 'react';
import styled from 'styled-components';

const Msg = styled.div`
  padding: 25px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
`;

export interface Props {
  text: string;
}

const Message: React.FC<Props> = ({ text }) => <Msg>{text}</Msg>;

export default Message;
