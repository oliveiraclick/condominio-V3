import React from 'react';
import { PackagePickupFlow } from '../components/PackagePickupFlow';

interface AdminPackagePickupProps {
    onBack: () => void;
    currentUser: any;
}

export const AdminPackagePickup: React.FC<AdminPackagePickupProps> = ({ onBack, currentUser }) => {
    return (
        <PackagePickupFlow
            open={true}
            onClose={onBack}
            currentUser={currentUser}
        />
    );
};
