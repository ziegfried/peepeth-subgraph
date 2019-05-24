import styled from 'styled-components';

export interface Props {
  readonly width?: number;
  readonly active?: boolean;
}

const Card = styled.div<Props>`
  box-shadow: rgba(0, 0, 0, 0.063) 0px 0px 2px 0px, rgba(0, 0, 0, 0.125) 0px 2px 4px 0px;
  border-radius: 4px;
  margin: 24px 0;
  width: ${props => props.width || 350}px;
  background: ${props => (props.active ? 'rgba(0,0,0,.1)' : 'transparent')};
`;

export const Clickable = styled(Card)`
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

export default Card;
