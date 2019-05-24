import React from 'react';
import styled from 'styled-components';
import Spinner from './Spinner';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
`;

const Button = styled.button``;

interface Props {
  isFetching?: boolean;
  onClick: () => void;
}

const FetchMoreButton: React.FC<Props> = ({ isFetching, onClick }) => (
  <Wrapper>
    {isFetching ? <Spinner title="Fetching..." /> : <Button onClick={onClick}>Fetch more...</Button>}
  </Wrapper>
);

export default FetchMoreButton;
