import { useState, useMemo } from 'react';
import { Button } from '@shadcnComponents/ui/button';
import { Input } from '@shadcnComponents/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@shadcnComponents/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@shadcnComponents/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@shadcnComponents/ui/dialog';
import { Card, CardContent } from '@shadcnComponents/ui/card';
import { QuoteStatusBadge, QUOTE_STATUSES } from '@adminPages/Quotes/QuoteStatusBadge';
import { QuoteActions } from '@adminPages/Quotes/QuoteActions';
import { QuoteForm } from '@adminPages/Quotes/QuoteForm';
import { QuotePreview } from '@adminPages/Quotes/QuotePreview';
import { useQuotes, useQuote, useQuoteStats, useQuoteActions } from '@adminHooks/billing/useQuotes';
import { downloadQuotePdf, getQuotePdfPreviewUrl } from "@adminHooks/billing/quotes-api";
import { Plus, Search, FileText, Loader2 } from 'lucide-react';

export function QuotesList() {
    const [searchInput, setSearchInput] = useState('');
    const { quotes, loading, filters, updateFilters, refresh } = useQuotes();
    const { stats } = useQuoteStats();
    const actions = useQuoteActions(refresh);

    // Dialog states
    const [formDialog, setFormDialog] = useState({ open: false, quoteId: null });
    const [viewDialog, setViewDialog] = useState({ open: false, quoteId: null });

    // Load quote for editing/viewing
    const { quote: editingQuote, loading: editLoading } = useQuote(formDialog.quoteId);
    const { quote: viewingQuote, loading: viewLoading } = useQuote(viewDialog.quoteId);

    const handleSearch = (e) => {
        e.preventDefault();
        updateFilters({ search: searchInput });
    };

    const handleStatusFilter = (value) => {
        updateFilters({ status: value === 'all' ? null : value, search: null });
        setSearchInput('');
    };

    const clearFilters = () => {
        updateFilters({ status: null, search: null });
        setSearchInput('');
    };

    const openCreateDialog = () => {
        setFormDialog({ open: true, quoteId: null });
    };

    const openEditDialog = (quoteId) => {
        setFormDialog({ open: true, quoteId });
    };

    const openViewDialog = (quoteId) => {
        setViewDialog({ open: true, quoteId });
    };

    const closeFormDialog = () => {
        setFormDialog({ open: false, quoteId: null });
    };

    const closeViewDialog = () => {
        setViewDialog({ open: false, quoteId: null });
    };

    const handleFormSubmit = async (data) => {
        try {
            if (formDialog.quoteId) {
                await actions.update(formDialog.quoteId, data);
            } else {
                await actions.create(data);
            }
            closeFormDialog();
        } catch (err) {
            // Error is handled in the hook
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString('fr-FR') + ' €';
    };

    // Stats cards
    const statsCards = useMemo(() => [
        {
            label: 'Brouillons',
            value: stats.draft?.count || 0,
            status: 'draft',
        },
        {
            label: 'Envoyés',
            value: stats.sent?.count || 0,
            status: 'sent',
        },
        {
            label: 'Acceptés',
            value: stats.accepted?.count || 0,
            amount: stats.accepted?.total,
            status: 'accepted',
        },
        {
            label: 'Facturés',
            value: stats.invoiced?.count || 0,
            amount: stats.invoiced?.total,
            status: 'invoiced',
        },
    ], [stats]);

    const hasActiveFilters = filters.status || filters.search;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Devis</h1>
                    <p className="text-muted-foreground">
                        Gérez vos devis et suivez leur avancement
                    </p>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau devis
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                {statsCards.map((stat) => (
                    <Card
                        key={stat.status}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleStatusFilter(stat.status)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <QuoteStatusBadge status={stat.status} />
                            </div>
                            <p className="text-2xl font-semibold mt-2">{stat.value}</p>
                            {stat.amount > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    {formatPrice(stat.amount)}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button type="submit" variant="secondary">
                        Rechercher
                    </Button>
                </form>

                <div className="flex gap-2">
                    <Select
                        value={filters.status || 'all'}
                        onValueChange={handleStatusFilter}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tous les statuts" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            {QUOTE_STATUSES.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="ghost" onClick={clearFilters}>
                            Effacer
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Référence</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Forfait</TableHead>
                            <TableHead>Date événement</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : quotes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-muted-foreground">
                                            {hasActiveFilters
                                                ? 'Aucun devis trouvé'
                                                : 'Aucun devis pour le moment'}
                                        </p>
                                        {!hasActiveFilters && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={openCreateDialog}
                                            >
                                                Créer un devis
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            quotes.map((quote) => (
                                <TableRow
                                    key={quote.id}
                                    className="cursor-pointer"
                                    onClick={() => openViewDialog(quote.id)}
                                >
                                    <TableCell className="font-medium">
                                        {quote.reference}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p>{quote.clientFullName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {quote.clientEmail}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{quote.packageName || '—'}</TableCell>
                                    <TableCell>{formatDate(quote.eventDate)}</TableCell>
                                    <TableCell className="font-medium">
                                        {formatPrice(quote.totalAmount)}
                                    </TableCell>
                                    <TableCell>
                                        <QuoteStatusBadge
                                            status={quote.status}
                                            showExpired
                                            isExpired={quote.isExpired}
                                        />
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <QuoteActions
                                            quote={quote}
                                            onView={() => openViewDialog(quote.id)}
                                            onEdit={() => openEditDialog(quote.id)}
                                            onSend={() => actions.send(quote.id)}
                                            onDuplicate={() => actions.duplicate(quote.id)}
                                            onDelete={() => actions.remove(quote.id)}
                                            onStatusChange={(status) => actions.updateStatus(quote.id, status)}
                                            onDownloadPdf={() => downloadQuotePdf(quote.id, `Devis_${quote.reference}.pdf`)}
                                            onPreviewPdf={() => window.open(getQuotePdfPreviewUrl(quote.id), '_blank')}
                                            loading={actions.loading}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={formDialog.open} onOpenChange={closeFormDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {formDialog.quoteId ? 'Modifier le devis' : 'Nouveau devis'}
                        </DialogTitle>
                    </DialogHeader>
                    {editLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <QuoteForm
                            quote={editingQuote}
                            onSubmit={handleFormSubmit}
                            onCancel={closeFormDialog}
                            loading={actions.loading}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewDialog.open} onOpenChange={closeViewDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Détail du devis</DialogTitle>
                    </DialogHeader>
                    {viewLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <QuotePreview quote={viewingQuote} />
                            {viewingQuote?.canBeEdited && (
                                <div className="flex justify-end pt-4 border-t">
                                    <Button
                                        onClick={() => {
                                            closeViewDialog();
                                            openEditDialog(viewingQuote.id);
                                        }}
                                    >
                                        Modifier
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
