import { Badge } from '@shadcnComponents/ui/badge';

const STATUS_CONFIG = {
    draft: {
        label: 'Brouillon',
        variant: 'secondary',
        className: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
    },
    sent: {
        label: 'Envoyé',
        variant: 'default',
        className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    },
    accepted: {
        label: 'Accepté',
        variant: 'default',
        className: 'bg-green-100 text-green-700 hover:bg-green-100',
    },
    declined: {
        label: 'Refusé',
        variant: 'destructive',
        className: 'bg-red-100 text-red-700 hover:bg-red-100',
    },
    invoiced: {
        label: 'Facturé',
        variant: 'default',
        className: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
    },
};

export function QuoteStatusBadge({ status, showExpired = false, isExpired = false }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

    if (showExpired && isExpired && status === 'sent') {
        return (
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                Expiré
            </Badge>
        );
    }

    return (
        <Badge className={config.className}>
            {config.label}
        </Badge>
    );
}

export function getStatusLabel(status) {
    return STATUS_CONFIG[status]?.label || status;
}

export const QUOTE_STATUSES = [
    { value: 'draft', label: 'Brouillon' },
    { value: 'sent', label: 'Envoyé' },
    { value: 'accepted', label: 'Accepté' },
    { value: 'declined', label: 'Refusé' },
    { value: 'invoiced', label: 'Facturé' },
];
