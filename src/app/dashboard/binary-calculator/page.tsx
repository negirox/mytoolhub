
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const isValidForBase = (str: string, base: number) => {
    if (str === '') return true;
    try {
        // Use BigInt for arbitrary precision, which supports up to base 36
        BigInt.prototype.toString.call(parseInt(str, base));
        // Check if parsing and converting back results in the same string, handles case sensitivity for hex etc.
        return parseInt(str, base).toString(base).toLowerCase() === str.toLowerCase();
    } catch (e) {
        return false;
    }
};

const isValidBinary = (str: string) => /^[01]+$/.test(str) || str === '';

export default function BinaryCalculatorPage() {
    // Arithmetic State
    const [binary1, setBinary1] = useState('10101010');
    const [binary2, setBinary2] = useState('11001100');
    const [operator, setOperator] = useState('+');
    const [arithmeticResult, setArithmeticResult] = useState<{ binary: string, decimal: string, calculation: string } | null>(null);

    // From Any to Binary
    const [fromBaseInput, setFromBaseInput] = useState('FF');
    const [fromBase, setFromBase] = useState('16');
    const [fromBaseResult, setFromBaseResult] = useState('');

    // From Binary to Any
    const [toBaseInput, setToBaseInput] = useState('11111111');
    const [toBase, setToBase] = useState('16');
    const [toBaseResult, setToBaseResult] = useState('');


    const handleArithmeticCalculate = () => {
        if (!isValidBinary(binary1) || !isValidBinary(binary2)) {
            setArithmeticResult({ binary: 'Invalid Binary Input', decimal: '', calculation: '' });
            return;
        }

        const num1 = parseInt(binary1, 2) || 0;
        const num2 = parseInt(binary2, 2) || 0;
        let result = 0;

        switch (operator) {
            case '+': result = num1 + num2; break;
            case '-': result = num1 - num2; break;
            case '×': result = num1 * num2; break;
            case '÷':
                if (num2 === 0) {
                    setArithmeticResult({ binary: 'Error: Cannot divide by zero', decimal: '', calculation: '' });
                    return;
                }
                result = Math.floor(num1 / num2);
                break;
            default: return;
        }

        setArithmeticResult({
            binary: result.toString(2),
            decimal: result.toString(),
            calculation: `${num1} ${operator} ${num2} = ${result}`
        });
    };

    const handleFromBaseConvert = () => {
        const base = parseInt(fromBase);
        if (isNaN(base) || base < 2 || base > 36) {
            setFromBaseResult('Base must be 2-36');
            return;
        }
        if (!isValidForBase(fromBaseInput, base)) {
            setFromBaseResult('Invalid input for base');
            return;
        }
        setFromBaseResult(fromBaseInput ? parseInt(fromBaseInput, base).toString(2) : '');
    };

    const handleToBaseConvert = () => {
        const base = parseInt(toBase);
         if (isNaN(base) || base < 2 || base > 36) {
            setFromBaseResult('Base must be 2-36');
            return;
        }
        if (!isValidBinary(toBaseInput)) {
            setToBaseResult('Invalid Binary Input');
            return;
        }
        setToBaseResult(toBaseInput ? parseInt(toBaseInput, 2).toString(base).toUpperCase() : '');
    };

    // Auto-calculate on input change
    useMemo(handleArithmeticCalculate, [binary1, binary2, operator]);
    useMemo(handleFromBaseConvert, [fromBaseInput, fromBase]);
    useMemo(handleToBaseConvert, [toBaseInput, toBase]);

    const conversionTableData = Array.from({ length: 20 }, (_, i) => {
        const decimal = i + 1;
        return {
            decimal: decimal,
            binary: decimal.toString(2),
            hex: decimal.toString(16).toUpperCase(),
        };
    });


    return (
        <>
            <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
                <h1 className="font-headline text-xl font-semibold">Binary Calculator</h1>
            </header>
            <main className="flex-1 p-4 md:p-6">
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Binary Arithmetic Calculator</CardTitle>
                            <CardDescription>Perform addition, subtraction, multiplication, or division on two binary numbers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                                <Input type="text" value={binary1} onChange={e => setBinary1(e.target.value)} className="w-full md:w-auto flex-1 font-mono text-center" />
                                <Select value={operator} onValueChange={setOperator}>
                                    <SelectTrigger className="w-full md:w-20"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="+">+</SelectItem>
                                        <SelectItem value="-">-</SelectItem>
                                        <SelectItem value="×">×</SelectItem>
                                        <SelectItem value="÷">÷</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input type="text" value={binary2} onChange={e => setBinary2(e.target.value)} className="w-full md:w-auto flex-1 font-mono text-center" />
                            </div>
                            {arithmeticResult && (
                                <div className="mt-4 rounded-lg border p-4 text-center">
                                    <Label>Result</Label>
                                    <p className="text-xl md:text-2xl font-bold text-primary break-all font-mono">{arithmeticResult.binary}</p>
                                    <p className="text-sm text-muted-foreground break-all font-mono">({arithmeticResult.calculation})</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                             <CardHeader>
                                <CardTitle className="font-headline">Convert to Binary</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="from-base-input">Value</Label>
                                    <Input id="from-base-input" value={fromBaseInput} onChange={e => setFromBaseInput(e.target.value)} className="font-mono"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="from-base">From Base (2-36)</Label>
                                    <Input id="from-base" type="number" min="2" max="36" value={fromBase} onChange={e => setFromBase(e.target.value)} className="font-mono"/>
                                </div>
                                {fromBaseResult && (
                                     <div className="rounded-lg border p-4 text-center">
                                        <Label>Binary Result</Label>
                                        <p className="text-xl font-bold text-primary break-all font-mono">{fromBaseResult}</p>
                                    </div>
                                )}
                             </CardContent>
                        </Card>
                         <Card>
                             <CardHeader>
                                <CardTitle className="font-headline">Convert from Binary</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                 <div className="space-y-2">
                                    <Label htmlFor="to-base-input">Binary Value</Label>
                                    <Input id="to-base-input" value={toBaseInput} onChange={e => setToBaseInput(e.target.value)} className="font-mono"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="to-base">To Base (2-36)</Label>
                                    <Input id="to-base" type="number" min="2" max="36" value={toBase} onChange={e => setToBase(e.target.value)} className="font-mono"/>
                                </div>
                                {toBaseResult && (
                                     <div className="rounded-lg border p-4 text-center">
                                        <Label>Result</Label>
                                        <p className="text-xl font-bold text-primary break-all font-mono">{toBaseResult}</p>
                                    </div>
                                )}
                             </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Conversion Table</CardTitle>
                            <CardDescription>A quick reference for decimal, binary, and hexadecimal values.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Decimal</TableHead>
                                        <TableHead>Binary</TableHead>
                                        <TableHead>Hexadecimal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {conversionTableData.map(item => (
                                        <TableRow key={item.decimal}>
                                            <TableCell>{item.decimal}</TableCell>
                                            <TableCell className="font-mono">{item.binary}</TableCell>
                                            <TableCell className="font-mono">{item.hex}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>What is a Number Base?</AccordionTrigger>
                                    <AccordionContent>
                                       A number base is the number of unique digits used to represent numbers in a positional numeral system. The most common is base-10 (decimal), which uses digits 0-9. Binary is base-2 (digits 0-1), and hexadecimal is base-16 (digits 0-9 and A-F). This calculator can handle any base from 2 to 36.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>How do you convert from another base to binary?</AccordionTrigger>
                                    <AccordionContent>
                                        The calculator first converts the number from its original base (e.g., hexadecimal `FF`) into its decimal equivalent (255). Then, it converts that decimal number into its binary representation (11111111). This two-step process allows for conversion between any two bases.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>What is the binary number system?</AccordionTrigger>
                                    <AccordionContent>
                                        The binary number system is a base-2 system that uses only two digits: 0 and 1. Each digit is called a "bit." This system is the fundamental language of computers because the two states (0 and 1) can be easily represented by electronic circuits being off or on. For example, the decimal number 5 is represented as 101 in binary.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger>How does binary addition work?</AccordionTrigger>
                                    <AccordionContent>
                                        Binary addition follows these rules: 0+0=0, 0+1=1, 1+0=1, and 1+1=0 (with a carry-over of 1 to the next position). For example, adding 101 (5) and 110 (6):
                                        <pre className="mt-2 p-2 bg-muted rounded-md font-mono">
  101
+ 110
-----
 1011 (which is 11 in decimal)
                                        </pre>
                                    </AccordionContent>
                                </AccordionItem>
                                 <AccordionItem value="item-5">
                                    <AccordionTrigger>What is the hexadecimal system?</AccordionTrigger>
                                    <AccordionContent>
                                        The hexadecimal system is a base-16 number system. It uses 16 symbols: the numbers 0-9 and the letters A-F to represent values 10-15. It's commonly used in computing because it's a more human-readable way to represent long binary numbers. For example, the color white is often represented as #FFFFFF in hex.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-6">
                                    <AccordionTrigger>How do you convert from binary to hexadecimal?</AccordionTrigger>
                                    <AccordionContent>
                                        To convert from binary to hex, you group the binary digits into sets of four, starting from the right. Each group of four binary digits corresponds to exactly one hexadecimal digit. For example, the binary number 11010110 can be grouped into 1101 and 0110. 1101 in binary is D in hex, and 0110 is 6. So, 11010110 in binary is D6 in hexadecimal.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}
