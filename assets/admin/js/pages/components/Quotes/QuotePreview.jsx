import { Card, CardContent, CardHeader, CardTitle } from '@shadcnComponents/ui/card';
import { Button } from "@shadcnComponents/ui/button";
import { QuoteStatusBadge } from '@adminPages/Quotes/QuoteStatusBadge';
import { downloadQuotePdf, getQuotePdfPreviewUrl } from "@adminHooks/billing/quotes-api";
import { Check, Star, Calendar, MapPin, User, Mail, Phone, Download, ExternalLink } from 'lucide-react';

export function QuotePreview({ quote }) {
    if (!quote) return null;

    const content = quote.customContent || {};

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-semibold">{quote.reference}</h2>
                        <QuoteStatusBadge
                            status={quote.status}
                            showExpired
                            isExpired={quote.isExpired}
                        />
                    </div>
                    {quote.packageName && (
                        <p className="text-muted-foreground">{quote.packageName}</p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-3xl font-semibold">{formatPrice(quote.totalAmount)} €</p>
                    {quote.depositAmount && (
                        <p className="text-sm text-muted-foreground">
                            Acompte {quote.depositPercentage}% : {formatPrice(quote.depositAmount)} €
                        </p>
                    )}
                </div>
            </div>

            {/* PDF Actions */}
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadQuotePdf(quote.id, `Devis_${quote.reference}.pdf`)}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger PDF
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getQuotePdfPreviewUrl(quote.id), '_blank')}
                >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Aperçu PDF
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Client info */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Client</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{quote.clientFirstName} {quote.clientLastName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${quote.clientEmail}`} className="text-primary hover:underline">
                                {quote.clientEmail}
                            </a>
                        </div>
                        {quote.clientPhone && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <a href={`tel:${quote.clientPhone}`} className="hover:underline">
                                    {quote.clientPhone}
                                </a>
                            </div>
                        )}
                        {quote.clientAddress && (
                            <p className="text-sm text-muted-foreground pt-2">
                                {quote.clientAddress}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Event info */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Événement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {quote.eventType && (
                            <p className="font-medium">{quote.eventType}</p>
                        )}
                        {quote.eventDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{formatDate(quote.eventDate)}</span>
                            </div>
                        )}
                        {quote.eventLocation && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{quote.eventLocation}</span>
                            </div>
                        )}
                        {quote.validUntil && (
                            <p className="text-sm text-muted-foreground pt-2">
                                Devis valable jusqu'au {formatDate(quote.validUntil)}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Package content */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Détail de la prestation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 mb-6">
                        {content.duration && (
                            <div>
                                <p className="text-sm text-muted-foreground">Durée</p>
                                <p className="font-medium">{content.duration}</p>
                            </div>
                        )}
                        {content.photos_count && (
                            <div>
                                <p className="text-sm text-muted-foreground">Photos</p>
                                <p className="font-medium">{content.photos_count}</p>
                            </div>
                        )}
                        {content.delivery && (
                            <div>
                                <p className="text-sm text-muted-foreground">Livraison</p>
                                <p className="font-medium">{content.delivery}</p>
                            </div>
                        )}
                        {content.delivery_time && (
                            <div>
                                <p className="text-sm text-muted-foreground">Délai</p>
                                <p className="font-medium">{content.delivery_time}</p>
                            </div>
                        )}
                    </div>

                    {content.inclusions?.length > 0 && (
                        <div className="mb-6">
                            <p className="text-sm text-muted-foreground mb-3">Inclusions</p>
                            <ul className="space-y-2">
                                {content.inclusions.map((item, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {content.extras?.length > 0 && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-3">Bonus</p>
                            <ul className="space-y-2">
                                {content.extras.map((item, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Notes */}
            {(quote.notes || quote.internalNotes) && (
                <div className="grid gap-6 md:grid-cols-2">
                    {quote.notes && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Notes (visibles sur le devis)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-sm">{quote.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                    {quote.internalNotes && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Notes internes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                    {quote.internalNotes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Timestamps */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <p>Créé le {formatDate(quote.createdAt)}</p>
                {quote.sentAt && <p>Envoyé le {formatDate(quote.sentAt)}</p>}
                {quote.acceptedAt && <p>Accepté le {formatDate(quote.acceptedAt)}</p>}
                {quote.declinedAt && <p>Refusé le {formatDate(quote.declinedAt)}</p>}
            </div>
        </div>
    );
}
