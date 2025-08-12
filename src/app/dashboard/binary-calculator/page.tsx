
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const isValidBinary = (str: string) => /^[01]+$/.test(str) || str === '';
const isValidHex = (str: string) => /^[0-9a-fA-F]+$/.test(str) || str === '';

export default function BinaryCalculatorPage() {
    // Arithmetic State
    const [binary1, setBinary1] = useState('10101010');
    const [binary2, setBinary2] = useState('11001100');
    const [operator, setOperator] = useState('+');
    const [arithmeticResult, setArithmeticResult] = useState<{ binary: string, decimal: string, calculation: string } | null>(null);

    // Bin to Dec State
    const [binToDecInput, setBinToDecInput] = useState('10101010');
    const [binToDecResult, setBinToDecResult] = useState('');

    // Dec to Bin State
    const [decToBinInput, setDecToBinInput] = useState('170');
    const [decToBinResult, setDecToBinResult] = useState('');

    // Bin to Hex State
    const [binToHexInput, setBinToHexInput] = useState('1111000010101010');
    const [binToHexResult, setBinToHexResult] = useState('');

    // Hex to Bin State
    const [hexToBinInput, setHexToBinInput] = useState('F0AA');
    const [hexToBinResult, setHexToBinResult] = useState('');


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

    const handleBinToDecConvert = () => {
        if (!isValidBinary(binToDecInput)) {
            setBinToDecResult('Invalid Binary Input');
            return;
        }
        setBinToDecResult(binToDecInput ? parseInt(binToDecInput, 2).toString() : '');
    };

    const handleDecToBinConvert = () => {
        const num = parseInt(decToBinInput, 10);
        if (isNaN(num)) {
            setDecToBinResult('Invalid Decimal Input');
            return;
        }
        setDecToBinResult(decToBinInput ? num.toString(2) : '');
    };

     const handleBinToHexConvert = () => {
        if (!isValidBinary(binToHexInput)) {
            setBinToHexResult('Invalid Binary Input');
            return;
        }
        setBinToHexResult(binToHexInput ? parseInt(binToHexInput, 2).toString(16).toUpperCase() : '');
    };

    const handleHexToBinConvert = () => {
        if (!isValidHex(hexToBinInput)) {
            setHexToBinResult('Invalid Hex Input');
            return;
        }
        setHexToBinResult(hexToBinInput ? parseInt(hexToBinInput, 16).toString(2) : '');
    };
    
    // Auto-calculate on input change
    useMemo(handleArithmeticCalculate, [binary1, binary2, operator]);
    useMemo(handleBinToDecConvert, [binToDecInput]);
    useMemo(handleDecToBinConvert, [decToBinInput]);
    useMemo(handleBinToHexConvert, [binToHexInput]);
    useMemo(handleHexToBinConvert, [hexToBinInput]);


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
                                <CardTitle className="font-headline">Binary to Decimal</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bin-to-dec">Binary Value</Label>
                                    <Input id="bin-to-dec" value={binToDecInput} onChange={e => setBinToDecInput(e.target.value)} className="font-mono"/>
                                </div>
                                {binToDecResult && (
                                     <div className="rounded-lg border p-4 text-center">
                                        <Label>Decimal Result</Label>
                                        <p className="text-xl font-bold text-primary break-all font-mono">{binToDecResult}</p>
                                    </div>
                                )}
                             </CardContent>
                        </Card>
                         <Card>
                             <CardHeader>
                                <CardTitle className="font-headline">Decimal to Binary</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dec-to-bin">Decimal Value</Label>
                                    <Input id="dec-to-bin" type="number" value={decToBinInput} onChange={e => setDecToBinInput(e.target.value)} className="font-mono"/>
                                </div>
                                 {decToBinResult && (
                                     <div className="rounded-lg border p-4 text-center">
                                        <Label>Binary Result</Label>
                                        <p className="text-xl font-bold text-primary break-all font-mono">{decToBinResult}</p>
                                    </div>
                                )}
                             </CardContent>
                        </Card>
                         <Card>
                             <CardHeader>
                                <CardTitle className="font-headline">Binary to Hexadecimal</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bin-to-hex">Binary Value</Label>
                                    <Input id="bin-to-hex" value={binToHexInput} onChange={e => setBinToHexInput(e.target.value)} className="font-mono"/>
                                </div>
                                {binToHexResult && (
                                     <div className="rounded-lg border p-4 text-center">
                                        <Label>Hexadecimal Result</Label>
                                        <p className="text-xl font-bold text-primary break-all font-mono">{binToHexResult}</p>
                                    </div>
                                )}
                             </CardContent>
                        </Card>
                         <Card>
                             <CardHeader>
                                <CardTitle className="font-headline">Hexadecimal to Binary</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hex-to-bin">Hexadecimal Value</Label>
                                    <Input id="hex-to-bin" value={hexToBinInput} onChange={e => setHexToBinInput(e.target.value)} className="font-mono"/>
                                </div>
                                 {hexToBinResult && (
                                     <div className="rounded-lg border p-4 text-center">
                                        <Label>Binary Result</Label>
                                        <p className="text-xl font-bold text-primary break-all font-mono">{hexToBinResult}</p>
                                    </div>
                                )}
                             </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>What is the binary number system?</AccordionTrigger>
                                    <AccordionContent>
                                        The binary number system is a base-2 system that uses only two digits: 0 and 1. Each digit is called a "bit." This system is the fundamental language of computers because the two states (0 and 1) can be easily represented by electronic circuits being off or on. For example, the decimal number 5 is represented as 101 in binary.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>How do you convert from decimal to binary?</AccordionTrigger>
                                    <AccordionContent>
                                        To convert a decimal number to binary, you repeatedly divide the decimal number by 2 and record the remainder. You continue until the quotient is 0. The binary representation is the sequence of remainders read from bottom to top. For example, to convert 13 to binary: 13÷2 = 6 R 1, 6÷2 = 3 R 0, 3÷2 = 1 R 1, 1÷2 = 0 R 1. Reading remainders up gives 1101.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>How do you convert from binary to decimal?</AccordionTrigger>
                                    <AccordionContent>
                                        To convert a binary number to decimal, you multiply each digit by 2 raised to the power of its position, starting from 0 on the right. Then, you add all the results. For example, the binary number 1011 is: (1 * 2³) + (0 * 2²) + (1 * 2¹) + (1 * 2⁰) = 8 + 0 + 2 + 1 = 11.
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
