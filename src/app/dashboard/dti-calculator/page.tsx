
'use client';

import { useState, useMemo, useContext, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { CurrencyContext, Currency } from '@/context/CurrencyContext';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
};

type Period = 'Month' | 'Year';

interface IncomeItem {
    id: string;
    label: string;
    value: string;
    period: Period;
    tooltip?: string;
}
interface DebtItem {
    id: string;
    label: string;
    value: string;
    period: Period;
    isHousing: boolean;
    tooltip?: string;
}

const getDtiCategory = (dti: number) => {
    if (dti <= 35) return { text: 'Looking Good', color: 'hsl(var(--chart-2))' };
    if (dti <= 43) return { text: 'Needs Improvement', color: 'hsl(var(--chart-4))' };
    if (dti <= 49) return { text: 'Cause for Concern', color: 'hsl(var(--chart-5))' };
    return { text: 'High Risk', color: 'hsl(var(--chart-1))' };
};

export default function DtiCalculatorPage() {
  const currencyContext = useContext(CurrencyContext);
  if (!currencyContext) {
    throw new Error('useContext must be used within a CurrencyProvider');
  }
  const { globalCurrency } = currencyContext;

  const [currency, setCurrency] = useState<Currency>(globalCurrency);
  
  const [incomes, setIncomes] = useState<IncomeItem[]>([
      { id: 'salary', label: 'Salary & Earned Income', value: '60000', period: 'Year' },
      { id: 'pension', label: 'Pension & Social Security', value: '0', period: 'Year' },
      { id: 'investment', label: 'Investment & Savings', value: '0', period: 'Year', tooltip: 'Interest, capital gains, dividends, rental income...' },
      { id: 'other_income', label: 'Other Income', value: '0', period: 'Year', tooltip: 'Gift, alimony, child support...' },
  ]);

  const [debts, setDebts] = useState<DebtItem[]>([
      { id: 'rent', label: 'Rental Cost', value: '1200', period: 'Month', isHousing: true },
      { id: 'mortgage', label: 'Mortgage', value: '0', period: 'Month', isHousing: true },
      { id: 'property_tax', label: 'Property Tax', value: '0', period: 'Year', isHousing: true },
      { id: 'hoa', label: 'HOA Fees', value: '0', period: 'Month', isHousing: true },
      { id: 'home_insurance', label: 'Homeowner Insurance', value: '0', period: 'Year', isHousing: true },
      { id: 'credit_cards', label: 'Credit Cards', value: '200', period: 'Month', isHousing: false },
      { id: 'student_loan', label: 'Student Loan', value: '0', period: 'Month', isHousing: false },
      { id: 'auto_loan', label: 'Auto Loan', value: '250', period: 'Month', isHousing: false },
      { id: 'other_loans', label: 'Other Loans & Liabilities', value: '0', period: 'Month', isHousing: false, tooltip: 'Personal loan, child support, alimony, etc.' },
  ]);

  const [results, setResults] = useState<{
    dti: number;
    totalMonthlyIncome: number;
    totalMonthlyDebt: number;
    monthlyHouseDebt: number;
    monthlyOtherDebt: number;
  } | null>(null);
  
  useEffect(() => {
    setCurrency(globalCurrency);
  }, [globalCurrency]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { // Locale can be fixed as currency symbol is handled separately
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const handleIncomeChange = (id: string, field: 'value' | 'period', val: string) => {
      setIncomes(incomes.map(item => item.id === id ? {...item, [field]: val} : item));
  };
   const handleDebtChange = (id: string, field: 'value' | 'period', val: string) => {
      setDebts(debts.map(item => item.id === id ? {...item, [field]: val} : item));
  };

  const calculateDti = () => {
    const totalMonthlyIncome = incomes.reduce((acc, item) => {
        const value = parseFloat(item.value) || 0;
        return acc + (item.period === 'Year' ? value / 12 : value);
    }, 0);
    
    let totalMonthlyDebt = 0;
    let monthlyHouseDebt = 0;
    let monthlyOtherDebt = 0;

    debts.forEach(item => {
        const value = parseFloat(item.value) || 0;
        const monthlyValue = item.period === 'Year' ? value / 12 : value;
        totalMonthlyDebt += monthlyValue;
        if (item.isHousing) {
            monthlyHouseDebt += monthlyValue;
        } else {
            monthlyOtherDebt += monthlyValue;
        }
    });
    
    if (totalMonthlyIncome <= 0) {
        setResults(null);
        return;
    }

    const dti = (totalMonthlyDebt / totalMonthlyIncome) * 100;

    setResults({
        dti,
        totalMonthlyIncome,
        totalMonthlyDebt,
        monthlyHouseDebt,
        monthlyOtherDebt
    });
  }

  useEffect(() => {
    calculateDti();
  }, [incomes, debts, currency]);

  const dtiCategory = useMemo(() => (results ? getDtiCategory(results.dti) : null), [results]);

  const incomeBreakdownChartData = useMemo(() => {
    if (!results) return [];
    
    const remainingIncome = results.totalMonthlyIncome - results.totalMonthlyDebt;
    
    return [
      { name: 'houseDebt', value: results.monthlyHouseDebt, fill: 'var(--color-houseDebt)' },
      { name: 'otherDebt', value: results.monthlyOtherDebt, fill: 'var(--color-otherDebt)' },
      { name: 'remaining', value: remainingIncome > 0 ? remainingIncome : 0, fill: 'var(--color-remaining)' },
    ].filter(item => item.value > 0);
  }, [results]);

  const incomeBreakdownChartConfig = {
      houseDebt: { label: 'House Debts/Expenses', color: 'hsl(var(--chart-5))' },
      otherDebt: { label: 'Other Debts/Expenses', color: 'hsl(var(--chart-1))' },
      remaining: { label: 'Remaining Income', color: 'hsl(var(--chart-2))' },
  }


  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Debt-to-Income (DTI) Ratio Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Debt-to-Income (DTI) Ratio Calculator</CardTitle>
              <CardDescription>
                Your DTI ratio helps lenders assess your ability to repay loans. A lower DTI is generally better. The calculation updates automatically as you type.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6 max-w-xs">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={(val) => setCurrency(val as Currency)}>
                        <SelectTrigger id="currency">
                            <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 font-headline text-lg font-semibold text-green-600 dark:text-green-400"><TrendingUp /> Incomes (Before Tax)</h3>
                    {incomes.map(item => (
                        <div key={item.id} className="space-y-2">
                            <Label htmlFor={item.id} className="flex items-center gap-1">
                                {item.label}
                                {item.tooltip && (
                                    <Tooltip>
                                        <TooltipTrigger asChild><Info className="size-3" /></TooltipTrigger>
                                        <TooltipContent><p>{item.tooltip}</p></TooltipContent>
                                    </Tooltip>
                                )}
                            </Label>
                            <div className="flex gap-2">
                                <Input id={item.id} type="number" value={item.value} onChange={e => handleIncomeChange(item.id, 'value', e.target.value)} />
                                <Select value={item.period} onValueChange={val => handleIncomeChange(item.id, 'period', val as Period)}>
                                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Year">/ Year</SelectItem>
                                        <SelectItem value="Month">/ Month</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-4">
                     <h3 className="flex items-center gap-2 font-headline text-lg font-semibold text-red-600 dark:text-red-400"><TrendingDown /> Debts / Expenses</h3>
                     {debts.map(item => (
                        <div key={item.id} className="space-y-2">
                            <Label htmlFor={item.id} className="flex items-center gap-1">
                                {item.label}
                                {item.tooltip && (
                                    <Tooltip>
                                        <TooltipTrigger asChild><Info className="size-3" /></TooltipTrigger>
                                        <TooltipContent><p>{item.tooltip}</p></TooltipContent>
                                    </Tooltip>
                                )}
                            </Label>
                            <div className="flex gap-2">
                                <Input id={item.id} type="number" value={item.value} onChange={e => handleDebtChange(item.id, 'value', e.target.value)} />
                                <Select value={item.period} onValueChange={val => handleDebtChange(item.id, 'period', val as Period)}>
                                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Month">/ Month</SelectItem>
                                        <SelectItem value="Year">/ Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {results && dtiCategory && (
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Your DTI Ratio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-6">
                            <div className="text-center">
                                <p className="text-6xl font-bold" style={{ color: dtiCategory.color }}>
                                    {results.dti.toFixed(2)}<span className="text-4xl">%</span>
                                </p>
                                <p className="text-lg font-semibold" style={{ color: dtiCategory.color }}>
                                    {dtiCategory.text}
                                </p>
                            </div>
                            <div className="w-full max-w-md">
                                <Progress value={results.dti} className="h-4 [&>div]:bg-red-500" style={{'--progress-color': dtiCategory.color} as React.CSSProperties} />
                                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                    <span>0%</span>
                                    <span>35%</span>
                                    <span>43%</span>
                                    <span>50%+</span>
                                </div>
                            </div>
                        </div>
                        <Alert style={{borderColor: dtiCategory.color}}>
                            <AlertCircle className="h-4 w-4" style={{color: dtiCategory.color}} />
                            <AlertTitle style={{color: dtiCategory.color}}>What this means</AlertTitle>
                            <CardDescription>
                                Your total monthly debts (<span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(results.totalMonthlyDebt)}</span>) are {results.dti.toFixed(2)}% of your total monthly income (<span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(results.totalMonthlyIncome)}</span>). 
                                Lenders prefer a DTI ratio below 36%, with ratios above 43% often considered high risk.
                            </CardDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground">
                            This calculator provides an estimate for informational purposes only. Lenders may calculate DTI differently.
                        </p>
                    </CardFooter>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Income Breakdown</CardTitle>
                        <CardDescription>A visual representation of how your monthly income is allocated.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <ChartContainer config={incomeBreakdownChartConfig} className="min-h-[300px] w-full max-w-sm">
                            <PieChart>
                                <ChartTooltip 
                                    content={<ChartTooltipContent 
                                        nameKey="name" 
                                        formatter={(value, name, props) => {
                                            const itemKey = props.payload.name as keyof typeof incomeBreakdownChartConfig;
                                            return (
                                                <div className='flex flex-col'>
                                                    <span>{incomeBreakdownChartConfig[itemKey]?.label}: {formatCurrency(value as number)}</span>
                                                    <span className='text-muted-foreground text-xs'>
                                                        ({((value as number / results.totalMonthlyIncome) * 100).toFixed(1)}%)
                                                    </span>
                                                </div>
                                            )
                                        }} 
                                    />}
                                />
                                <Pie 
                                    data={incomeBreakdownChartData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={100}
                                    labelLine={false}
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        return (
                                        <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                        );
                                    }}
                                >
                                {incomeBreakdownChartData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.fill} />
                                ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent formatter={(value) => incomeBreakdownChartConfig[value as keyof typeof incomeBreakdownChartConfig].label} />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
          )}

           <Card>
            <CardHeader>
                <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What is a Debt-to-Income (DTI) ratio?</AccordionTrigger>
                        <AccordionContent>
                        The Debt-to-Income (DTI) ratio is a key financial metric that compares your total monthly debt payments to your gross monthly income. It's expressed as a percentage and helps lenders gauge your ability to manage monthly payments and repay debts.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="bg-green-50 dark:bg-green-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>Why is my DTI ratio important?</AccordionTrigger>
                        <AccordionContent>
                         Lenders, especially mortgage lenders, use DTI as a primary factor in determining your creditworthiness. A low DTI demonstrates a good balance between debt and income, indicating to lenders that you're less of a risk. A high DTI can make it difficult to qualify for new loans.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3" className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What is considered a good DTI ratio?</AccordionTrigger>
                        <AccordionContent>
                        <ul>
                            <li className="list-disc ml-4"><strong>35% or less:</strong> Looking good. You likely have a manageable amount of debt and should be in a good position to qualify for new credit.</li>
                            <li className="list-disc ml-4"><strong>36% to 43%:</strong> Needs improvement. While you may still qualify for some loans, your options might be limited. It's a good idea to work on lowering your debt.</li>
                            <li className="list-disc ml-4"><strong>44% or higher:</strong> High risk. It will be challenging to get approved for new loans. Lenders may see you as overextended.</li>
                        </ul>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4" className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>How can I lower my DTI ratio?</AccordionTrigger>
                        <AccordionContent>
                        There are two ways to lower your DTI: increase your income or decrease your debt. Focus on paying down high-interest debts like credit cards, avoid taking on new loans, and look for opportunities to boost your income.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5" className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What debts are included in the DTI calculation?</AccordionTrigger>
                        <AccordionContent>
                        DTI includes recurring monthly payments such as rent or mortgage, property taxes, HOA fees, car loans, student loans, credit card minimum payments, and other personal loans or court-ordered payments like alimony or child support. It does not typically include monthly expenses like utilities, food, or insurance.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
           </Card>

        </div>
      </main>
    </TooltipProvider>
  );
}
