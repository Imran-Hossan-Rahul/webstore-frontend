import React from 'react';
import { Badge } from './Badge';

export const StatusBadge = ({ status, ...props }) => {
  const normalizedStatus = status?.toLowerCase();
  
  let variant = 'default';
  
  if (['active', 'delivered', 'paid', 'success', 'verified'].includes(normalizedStatus)) {
    variant = 'success';
  } else if (['pending', 'processing', 'in review'].includes(normalizedStatus)) {
    variant = 'warning';
  } else if (['cancelled', 'failed', 'rejected', 'error'].includes(normalizedStatus)) {
    variant = 'danger';
  } else if (['new', 'open'].includes(normalizedStatus)) {
    variant = 'primary';
  }
  
  return (
    <Badge variant={variant} {...props}>
      {status || 'Unknown'}
    </Badge>
  );
};
