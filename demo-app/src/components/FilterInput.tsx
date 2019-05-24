import React from 'react';
import styled from 'styled-components';

const Ct = styled.div``;

const Label = styled.label`
  font-size: 11px;
`;

const Input = styled.input`
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 7px;
  display: block;
  width: 100%;
`;

export interface Props {
  value: string;
  onChange: (value: string) => void;
}

const FilterInput: React.FC<Props> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Ct>
      <Label>Filter Accounts</Label>
      <Input type="text" value={value} onChange={handleChange} placeholder="Enter name..." />
    </Ct>
  );
};

export default FilterInput;
