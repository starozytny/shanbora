import { useState, useEffect } from 'react';
import { Button } from '@shadcnComponents/ui/button';
import { Input } from '@shadcnComponents/ui/input';
import { Label } from '@shadcnComponents/ui/label';
import { Textarea } from '@shadcnComponents/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcnComponents/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shadcnComponents/ui/tabs';
import { PackageSelector, PackageContentEditor } from './PackageSelector';
import { useTemplates } from '@adminHooks/billing/useQuotes';
import { Loader2 } from 'lucide-react';

const DEFAULT_CONTENT = {
    duration: '',
    photos_count: '',
    delivery: '',
    delivery_time: '',
    inclusions: [],
    extras: [],
};

export function QuoteForm({ quote, onSubmit, onCancel, loading }) {
    const { templates, loading: templatesLoading } = useTemplates();
    const [activeTab, setActiveTab] = useState('package');
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const [formData, setFormData] = useState({
        clientFirstName: '',
        clientLastName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        eventDate: '',
        eventLocation: '',
        eventType: 'Mariage',
        packageName: '',
        totalAmount: '',
        depositPercentage: 30,
        customContent: DEFAULT_CONTENT,
        validUntil: '',
        notes: '',
        internalNotes: '',
    });

    const [errors, setErrors] = useState({});

    // Initialize form with existing quote data
    useEffect(() => {
        if (quote) {
            setFormData({
                clientFirstName: quote.clientFirstName || '',
                clientLastName: quote.clientLastName || '',
                clientEmail: quote.clientEmail || '',
                clientPhone: quote.clientPhone || '',
                clientAddress: quote.clientAddress || '',
                eventDate: quote.eventDate || '',
                eventLocation: quote.eventLocation || '',
                eventType: quote.eventType || 'Mariage',
                packageName: quote.packageName || '',
                totalAmount: quote.totalAmount || '',
                depositPercentage: quote.depositPercentage || 30,
                customContent: quote.customContent || DEFAULT_CONTENT,
                validUntil: quote.validUntil || '',
                notes: quote.notes || '',
                internalNotes: quote.internalNotes || '',
            });

            if (quote.templateId) {
                const template = templates.find(t => t.id === quote.templateId);
                if (template) setSelectedTemplate(template);
            }
        }
    }, [quote, templates]);

    // Set default validity date (30 days from now)
    useEffect(() => {
        if (!quote && !formData.validUntil) {
            const date = new Date();
            date.setDate(date.getDate() + 30);
            setFormData(prev => ({
                ...prev,
                validUntil: date.toISOString().split('T')[0],
            }));
        }
    }, [quote, formData.validUntil]);

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setFormData(prev => ({
            ...prev,
            packageName: template.name,
            totalAmount: template.basePrice,
            customContent: { ...template.defaultContent },
        }));
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.clientFirstName.trim()) {
            newErrors.clientFirstName = 'Le prénom est requis';
        }
        if (!formData.clientLastName.trim()) {
            newErrors.clientLastName = 'Le nom est requis';
        }
        if (!formData.clientEmail.trim()) {
            newErrors.clientEmail = "L'email est requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
            newErrors.clientEmail = "L'email n'est pas valide";
        }
        if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
            newErrors.totalAmount = 'Le montant doit être supérieur à 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) {
            // Focus first error tab
            if (errors.clientFirstName || errors.clientLastName || errors.clientEmail) {
                setActiveTab('client');
            }
            return;
        }

        const data = {
            ...formData,
            templateId: selectedTemplate?.id,
        };

        onSubmit(data);
    };

    const depositAmount = formData.totalAmount && formData.depositPercentage
        ? (parseFloat(formData.totalAmount) * formData.depositPercentage / 100).toFixed(2)
        : '0.00';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="package">Forfait</TabsTrigger>
                    <TabsTrigger value="client">Client</TabsTrigger>
                    <TabsTrigger value="event">Événement</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                {/* Package Tab */}
                <TabsContent value="package" className="space-y-6 mt-6">
                    <div>
                        <h3 className="text-lg font-medium mb-4">Sélectionnez un forfait</h3>
                        <PackageSelector
                            templates={templates}
                            selectedId={selectedTemplate?.id}
                            onSelect={handleTemplateSelect}
                            loading={templatesLoading}
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Personnaliser le contenu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PackageContentEditor
                                content={formData.customContent}
                                onChange={(content) => updateField('customContent', content)}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Tarification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="packageName">Nom du forfait</Label>
                                    <Input
                                        id="packageName"
                                        value={formData.packageName}
                                        onChange={(e) => updateField('packageName', e.target.value)}
                                        placeholder="Ex: Journée complète"
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="totalAmount">
                                        Montant total (€) *
                                    </Label>
                                    <Input
                                        id="totalAmount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.totalAmount}
                                        onChange={(e) => updateField('totalAmount', e.target.value)}
                                        className={`mt-1.5 ${errors.totalAmount ? 'border-red-500' : ''}`}
                                    />
                                    {errors.totalAmount && (
                                        <p className="text-sm text-red-500 mt-1">{errors.totalAmount}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="depositPercentage">
                                        Acompte (%) → {depositAmount} €
                                    </Label>
                                    <Input
                                        id="depositPercentage"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.depositPercentage}
                                        onChange={(e) => updateField('depositPercentage', parseInt(e.target.value) || 0)}
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Client Tab */}
                <TabsContent value="client" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Informations client</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="clientFirstName">Prénom *</Label>
                                    <Input
                                        id="clientFirstName"
                                        value={formData.clientFirstName}
                                        onChange={(e) => updateField('clientFirstName', e.target.value)}
                                        className={`mt-1.5 ${errors.clientFirstName ? 'border-red-500' : ''}`}
                                    />
                                    {errors.clientFirstName && (
                                        <p className="text-sm text-red-500 mt-1">{errors.clientFirstName}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="clientLastName">Nom *</Label>
                                    <Input
                                        id="clientLastName"
                                        value={formData.clientLastName}
                                        onChange={(e) => updateField('clientLastName', e.target.value)}
                                        className={`mt-1.5 ${errors.clientLastName ? 'border-red-500' : ''}`}
                                    />
                                    {errors.clientLastName && (
                                        <p className="text-sm text-red-500 mt-1">{errors.clientLastName}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="clientEmail">Email *</Label>
                                    <Input
                                        id="clientEmail"
                                        type="email"
                                        value={formData.clientEmail}
                                        onChange={(e) => updateField('clientEmail', e.target.value)}
                                        className={`mt-1.5 ${errors.clientEmail ? 'border-red-500' : ''}`}
                                    />
                                    {errors.clientEmail && (
                                        <p className="text-sm text-red-500 mt-1">{errors.clientEmail}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="clientPhone">Téléphone</Label>
                                    <Input
                                        id="clientPhone"
                                        type="tel"
                                        value={formData.clientPhone}
                                        onChange={(e) => updateField('clientPhone', e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="clientAddress">Adresse</Label>
                                <Textarea
                                    id="clientAddress"
                                    value={formData.clientAddress}
                                    onChange={(e) => updateField('clientAddress', e.target.value)}
                                    rows={2}
                                    className="mt-1.5"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Event Tab */}
                <TabsContent value="event" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Informations événement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="eventType">Type d'événement</Label>
                                    <Input
                                        id="eventType"
                                        value={formData.eventType}
                                        onChange={(e) => updateField('eventType', e.target.value)}
                                        placeholder="Ex: Mariage"
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="eventDate">Date</Label>
                                    <Input
                                        id="eventDate"
                                        type="date"
                                        value={formData.eventDate}
                                        onChange={(e) => updateField('eventDate', e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="eventLocation">Lieu</Label>
                                <Input
                                    id="eventLocation"
                                    value={formData.eventLocation}
                                    onChange={(e) => updateField('eventLocation', e.target.value)}
                                    placeholder="Ex: Château de Versailles"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="validUntil">Devis valable jusqu'au</Label>
                                <Input
                                    id="validUntil"
                                    type="date"
                                    value={formData.validUntil}
                                    onChange={(e) => updateField('validUntil', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Notes (visibles sur le devis)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => updateField('notes', e.target.value)}
                                    rows={6}
                                    placeholder="Ces notes seront visibles par le client sur le devis..."
                                />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Notes internes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={formData.internalNotes}
                                    onChange={(e) => updateField('internalNotes', e.target.value)}
                                    rows={6}
                                    placeholder="Notes privées, non visibles par le client..."
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {quote ? 'Enregistrer' : 'Créer le devis'}
                </Button>
            </div>
        </form>
    );
}
