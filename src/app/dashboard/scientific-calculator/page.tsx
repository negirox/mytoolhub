
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// A simple and safe evaluation function
const safeEval = (expr: string) => {
  // Replace user-friendly symbols with JS Math equivalents
  let sanitizedExpr = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/√\((.*?)\)/g, 'Math.sqrt($1)')
    .replace(/(\d+)\^(\d+)/g, 'Math.pow($1, $2)')
    .replace(/π/g, 'Math.PI')
    .replace(/e/g, 'Math.E')
    .replace(/sin\((.*?)\)/g, 'Math.sin(Math.PI / 180 * $1)') // Degrees to Radians
    .replace(/cos\((.*?)\)/g, 'Math.cos(Math.PI / 180 * $1)') // Degrees to Radians
    .replace(/tan\((.*?)\)/g, 'Math.tan(Math.PI / 180 * $1)') // Degrees to Radians
    .replace(/log\((.*?)\)/g, 'Math.log10($1)')
    .replace(/ln\((.*?)\)/g, 'Math.log($1)');

  // Validate the expression to only allow numbers, operators, and Math functions.
  // This is a basic security measure to prevent arbitrary code execution.
  const validPattern = /^[0-9\s()+\-*/.,^πeMathsqrtpowinlgsct]+$/;
  if (!validPattern.test(sanitizedExpr.replace(/PI/g, ''))) {
    return 'Invalid Expression';
  }

  try {
    const result = new Function('return ' + sanitizedExpr)();
    if (typeof result === 'number' && !isNaN(result)) {
        return Number(result.toFixed(10)); // Fix floating point issues
    }
    return 'Error';
  } catch (error) {
    return 'Error';
  }
};


export default function ScientificCalculatorPage() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const handleButtonClick = (value: string) => {
    setInput(prev => prev + value);
  };

  const handleFunctionClick = (func: string) => {
    setInput(prev => prev + `${func}(`);
  }

  const handleCalculate = () => {
    if (input === '') return;
    const result = safeEval(input);
    const calculation = `${input} = ${result}`;
    setHistory(prev => [calculation, ...prev].slice(0, 10));
    setInput(String(result));
  };

  const handleClear = () => {
    setInput('');
  };
  
  const handleDelete = () => {
      setInput(input.slice(0, -1));
  };

  const CalculatorButton = ({
    onClick,
    children,
    className,
    variant = 'secondary',
  }: {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    variant?: 'secondary' | 'default' | 'destructive' | 'outline' | 'ghost' | 'link' | null;
  }) => (
    <Button
      onClick={onClick}
      className={`h-14 text-xl font-bold rounded-lg ${className}`}
      variant={variant as any}
    >
      {children}
    </Button>
  );

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Scientific Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
         <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle className="font-headline text-center">Scientific Calculator</CardTitle>
                <CardDescription className="text-center">For complex calculations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-lg border bg-muted p-4 text-right">
                  <div className="text-3xl font-bold break-all min-h-[40px]">{input || '0'}</div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {/* Row 1 */}
                    <CalculatorButton onClick={() => handleFunctionClick('sin')}>sin</CalculatorButton>
                    <CalculatorButton onClick={() => handleFunctionClick('cos')}>cos</CalculatorButton>
                    <CalculatorButton onClick={() => handleFunctionClick('tan')}>tan</CalculatorButton>
                    <CalculatorButton onClick={handleClear} variant="destructive">C</CalculatorButton>
                    <CalculatorButton onClick={handleDelete}><Eraser className="size-6"/></CalculatorButton>
                    
                    {/* Row 2 */}
                    <CalculatorButton onClick={() => handleFunctionClick('log')}>log</CalculatorButton>
                    <CalculatorButton onClick={() => handleFunctionClick('ln')}>ln</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('(')}>(</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick(')')}>)</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('/')} variant="default">÷</CalculatorButton>

                    {/* Row 3 */}
                    <CalculatorButton onClick={() => handleButtonClick('7')}>7</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('8')}>8</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('9')}>9</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('√(')}>√</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('*')} variant="default">×</CalculatorButton>

                    {/* Row 4 */}
                    <CalculatorButton onClick={() => handleButtonClick('4')}>4</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('5')}>5</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('6')}>6</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('^')}>xʸ</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('-')} variant="default">-</CalculatorButton>
                    
                    {/* Row 5 */}
                    <CalculatorButton onClick={() => handleButtonClick('1')}>1</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('2')}>2</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('3')}>3</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('π')}>π</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('+')} variant="default">+</CalculatorButton>

                    {/* Row 6 */}
                    <CalculatorButton onClick={() => handleButtonClick('0')} className="col-span-2">0</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('.')}>.</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('e')}>e</CalculatorButton>
                    <CalculatorButton onClick={handleCalculate} variant="default">=</CalculatorButton>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">History</CardTitle>
                    <CardDescription>Your last 10 calculations.</CardDescription>
                </CardHeader>
                <CardContent>
                    {history.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center">No calculations yet.</p>
                    ) : (
                        <ul className="space-y-2 text-sm">
                            {history.map((calc, index) => (
                                <li key={index} className="p-2 rounded-md bg-muted/50 truncate text-right">
                                    {calc}
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
          </div>
        </div>
         <div className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How does this calculator handle the order of operations?</AccordionTrigger>
                            <AccordionContent>
                            This calculator respects the standard mathematical order of operations, often remembered by the acronym PEMDAS/BODMAS (Parentheses/Brackets, Exponents/Orders, Multiplication and Division, Addition and Subtraction). It evaluates expressions inside parentheses first, followed by exponents, then multiplication/division, and finally addition/subtraction.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Are the trigonometric functions (sin, cos, tan) in degrees or radians?</AccordionTrigger>
                            <AccordionContent>
                             The trigonometric functions on this calculator expect the input angle in **degrees**. The calculator automatically converts the degree input into radians before performing the calculation, as required by standard JavaScript Math functions.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What is the difference between 'log' and 'ln'?</AccordionTrigger>
                            <AccordionContent>
                            'log' represents the base-10 logarithm, which answers the question "10 to what power gives this number?". 'ln' represents the natural logarithm, which uses the mathematical constant 'e' (approximately 2.718) as its base. Both are crucial in various scientific and financial calculations.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>How do I use the exponent (xʸ) and square root (√) functions?</AccordionTrigger>
                            <AccordionContent>
                            For exponents, type the base number, then the '^' symbol, then the exponent (e.g., `2^3` for 2 to the power of 3). For square roots, press the '√' button, which will give you `√(`. Then enter the number you want to find the square root of and close the parenthesis (e.g., `√(9)`).
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-5">
                            <AccordionTrigger>Why do I get an 'Error' message?</AccordionTrigger>
                            <AccordionContent>
                            An 'Error' message can appear for several reasons, such as dividing by zero, having mismatched parentheses, or entering a mathematically invalid expression (e.g., `2++3`). Please check your input for any mistakes and try again.
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
