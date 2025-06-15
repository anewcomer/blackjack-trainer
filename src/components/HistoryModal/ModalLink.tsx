import React from 'react';
import { Link, SxProps } from '@mui/material';

interface ModalLinkProps {
  onClick: () => void;
  children: React.ReactNode;
  sx?: SxProps;
}

const ModalLink: React.FC<ModalLinkProps> = ({ onClick, children, sx }) => {
  return (
    <Link
      component="button"
      onClick={onClick}
      underline="hover"
      sx={{ ml: 2, fontWeight: 500, fontSize: '1rem', ...sx }}
    >
      {children}
    </Link>
  );
};

export default ModalLink;
