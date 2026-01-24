"use client";

import { useState } from "react";
import {
    LayoutGrid,
    List,
    Search,
    Globe,
    Palette,
    Server,
    Megaphone,
    Smartphone,
    Users,
    Bot,
    Zap,
    Briefcase,
    Package,
    Edit,
    Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ServiceDialog } from "./service-dialog";
import { DeleteServiceButton } from "./delete-service-button";

interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number;
    // New fields
    name_en?: string;
    name_pt?: string;
    name_de?: string;
    description_en?: string;
    description_pt?: string;
    description_de?: string;
    price_eur?: number;
    billing_type: 'one_time' | 'monthly' | 'yearly';
    active: boolean;
}

interface ServicesListProps {
    initialServices: Service[];
}

const categoryIcons: Record<string, any> = {
    Website: Globe,
    Branding: Palette,
    Hosting: Server,
    Ads: Megaphone,
    Social: Smartphone,
    Leads: Users,
    AI: Bot,
    Auto: Zap,
    Business: Briefcase,
    Other: Package
};

export function ServicesList({ initialServices }: ServicesListProps) {
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [billingFilter, setBillingFilter] = useState("all");

    // Extract categories
    const categories = Array.from(new Set(initialServices.map(s => {
        if (s.name.includes(':')) return s.name.split(':')[0].trim();
        return 'Other';
    }))).sort();

    // Filter services
    const filteredServices = initialServices.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

        const serviceCategory = service.name.includes(':') ? service.name.split(':')[0].trim() : 'Other';
        const matchesCategory = selectedCategory === 'all' || serviceCategory === selectedCategory;

        const matchesBilling = billingFilter === 'all' || service.billing_type === billingFilter;

        return matchesSearch && matchesCategory && matchesBilling;
    });

    // Helper to render status badge
    const StatusBadge = ({ active }: { active: boolean }) => (
        <Badge variant={active ? "default" : "secondary"}>
            {active ? "Active" : "Inactive"}
        </Badge>
    );

    // Helper to render billing badge
    const BillingBadge = ({ type }: { type: string }) => (
        <Badge variant="outline" className="capitalize">
            {type.replace('_', ' ')}
        </Badge>
    );

    // Helper to get icon
    const getServiceIcon = (name: string) => {
        const category = name.includes(':') ? name.split(':')[0].trim() : 'Other';
        const Icon = categoryIcons[category] || categoryIcons.Other;
        return Icon;
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search services..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={billingFilter} onValueChange={setBillingFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Billing Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Billing</SelectItem>
                            <SelectItem value="one_time">One Time</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 border-l pl-4 ml-2">
                    <div className="bg-muted p-1 rounded-md flex items-center">
                        <Button
                            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewMode('table')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="w-full justify-start h-auto flex-wrap gap-y-2 bg-transparent p-0">
                    <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
                    >
                        All Services
                    </TabsTrigger>
                    {categories.map(cat => (
                        <TabsTrigger
                            key={cat}
                            value={cat}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background ml-2"
                        >
                            {cat}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Content */}
            {filteredServices.length === 0 ? (
                <div className="text-center py-12 border rounded-lg border-dashed bg-muted/20">
                    <p className="text-muted-foreground">No services found matching your filters.</p>
                </div>
            ) : viewMode === 'table' ? (
                // Table View
                <div className="border rounded-md bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Billing</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredServices.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium">
                                        {service.name.replace(`${selectedCategory}: `, '')}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground max-w-md truncate">
                                        {service.description || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <BillingBadge type={service.billing_type} />
                                    </TableCell>
                                    <TableCell className="font-mono">CHF {service.price}</TableCell>
                                    <TableCell>
                                        <StatusBadge active={service.active} />
                                    </TableCell>
                                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                                        <ServiceDialog mode="edit" service={service} />
                                        <DeleteServiceButton id={service.id} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                // Utility for dynamic category color logic
                // Grid View - Ultra Compact & Modern
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {filteredServices.map((service) => {
                        const Icon = getServiceIcon(service.name);
                        const cleanName = service.name.includes(':') ? service.name.split(':')[1].trim() : service.name;
                        const category = service.name.includes(':') ? service.name.split(':')[0].trim() : 'Other';

                        const categoryColor =
                            category === 'Website' ? 'text-blue-500 bg-blue-500/10' :
                                category === 'Branding' ? 'text-pink-500 bg-pink-500/10' :
                                    category === 'Hosting' ? 'text-green-500 bg-green-500/10' :
                                        category === 'AI' ? 'text-purple-500 bg-purple-500/10' :
                                            category === 'Ads' ? 'text-orange-500 bg-orange-500/10' :
                                                'text-muted-foreground bg-muted';

                        return (
                            <Card key={service.id} className="group relative overflow-hidden transition-all hover:ring-1 hover:ring-primary/50 hover:shadow-md">
                                <CardHeader className="p-3 pb-0">
                                    <div className="flex justify-between items-center">
                                        <div className={`p-1.5 rounded-md ${categoryColor}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        {service.active ? (
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                        ) : (
                                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                        )}
                                    </div>
                                    <CardTitle className="pt-3 text-sm font-semibold truncate" title={service.name}>
                                        {cleanName}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="p-3 py-2">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold">CHF {service.price}</span>
                                        {service.billing_type !== 'one_time' && (
                                            <span className="text-[10px] text-muted-foreground uppercase">
                                                /{service.billing_type === 'monthly' ? 'mo' : 'yr'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1">
                                        {service.description || "No description"}
                                    </p>
                                </CardContent>

                                <CardFooter className="p-3 pt-0 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                                        {category}
                                    </Badge>
                                    <div className="flex gap-1">
                                        <ServiceDialog mode="edit" service={service} trigger={
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                        } />
                                        <DeleteServiceButton id={service.id} trigger={
                                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive">
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        } />
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
