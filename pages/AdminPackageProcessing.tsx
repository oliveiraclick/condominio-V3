import React from 'react';
import { PackageTriageFlow } from '../components/PackageTriageFlow';

interface AdminPackageProcessingProps {
    onBack: () => void;
    currentUser: any;
}

export const AdminPackageProcessing: React.FC<AdminPackageProcessingProps> = ({ onBack, currentUser }) => {
    return (
        <PackageTriageFlow
            open={true}
            onClose={onBack}
            currentUser={currentUser}
        />
    );
};
