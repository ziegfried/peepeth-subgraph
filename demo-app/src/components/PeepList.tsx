import React from 'react';
import styled from 'styled-components';
import Spinner from './Spinner';
import Message from './Message';

const Ct = styled.div``;

export interface Props {
  loading?: boolean;
  message?: string;
}

const PeepList: React.FC<Props> = ({ children, loading, message }) => (
  <Ct>
    <h3>Peeps</h3>
    {loading ? <Spinner /> : message ? <Message text={message} /> : children}
  </Ct>
);

export default PeepList;
