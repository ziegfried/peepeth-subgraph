import React, { useState } from 'react';
import styled from 'styled-components';

const AvatarBox = styled.div<{ size: string }>`
  margin: 0;
  padding: 0;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 50%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  overflow: hidden;
`;

function avatarUrlToCDN(url: string, size: 'small' | 'medium'): string | null {
  const [prefix, id, ext] = url.split(':');
  if (prefix === 'peepeth' && (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif')) {
    return `https://peepeth.s3-us-west-1.amazonaws.com/images/avatars/${encodeURIComponent(id)}/${size}.png`;
  }
  return null;
}

export interface Props {
  avatarUrl?: string;
  size?: 'small' | 'medium';
}

const Avatar: React.FC<Props> = ({ avatarUrl, size = 'small' }) => {
  const [brokenImage, setBrokenImage] = useState(false);
  const imageSize = size === 'small' ? '40' : '80';

  if (avatarUrl != null && !brokenImage) {
    const cdnUrl = avatarUrlToCDN(avatarUrl, size);
    if (cdnUrl != null) {
      return (
        <AvatarBox size={imageSize}>
          <img
            src={cdnUrl}
            width={imageSize}
            height={imageSize}
            data-original={avatarUrl}
            onError={() => setBrokenImage(true)}
            alt="Avatar"
          />
        </AvatarBox>
      );
    }
  }

  return <AvatarBox size={imageSize} />;
};

export default Avatar;
