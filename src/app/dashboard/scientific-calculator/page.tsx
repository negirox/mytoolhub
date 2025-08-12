
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const factorial = (n: number): number => {
    if (n < 0) return NaN; // Factorial is not defined for negative numbers
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
};

// A more robust and safe evaluation function
const safeEval = (expr: string, isDegrees: boolean) => {
  // Replace user-friendly symbols with JS Math equivalents
  let sanitizedExpr = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'Math.PI')
    .replace(/e/g, 'Math.E')
    .replace(/(\d+)!/g, (match, n) => factorial(parseInt(n)).toString())
    .replace(/(\d+(\.\d+)?)%/g, '($1/100)')
    .replace(/√\((.*?)\)/g, 'Math.sqrt($1)')
    .replace(/³√\((.*?)\)/g, 'Math.cbrt($1)')
    .replace(/(\d+)\^(\d+)/g, 'Math.pow($1, $2)')
    .replace(/(\d+) y√ (\d+)/g, 'Math.pow($2, 1/$1)') // y-th root of x is x^(1/y)
    .replace(/(\d+)²/g, 'Math.pow($1, 2)')
    .replace(/(\d+)³/g, 'Math.pow($1, 3)')
    .replace(/10\^\((.*?)\)/g, 'Math.pow(10, $1)')
    .replace(/e\^\((.*?)\)/g, 'Math.exp($1)')
    .replace(/1\/\((.*?)\)/g, '(1/($1))');


  const trigEval = (func: 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan', val: string) => {
    const num = parseFloat(val);
    if(isNaN(num)) return `Math.${func}(${val})`;

    if (isDegrees && ['sin', 'cos', 'tan'].includes(func)) {
      return `Math.${func}(${val} * (Math.PI / 180))`;
    }
    if (isDegrees && ['asin', 'acos', 'atan'].includes(func)) {
      return `(Math.${func}(${val}) * 180 / Math.PI)`;
    }
    return `Math.${func}(${val})`;
  }
  
  sanitizedExpr = sanitizedExpr
    .replace(/sin\((.*?)\)/g, (_, p1) => trigEval('sin', p1))
    .replace(/cos\((.*?)\)/g, (_, p1) => trigEval('cos', p1))
    .replace(/tan\((.*?)\)/g, (_, p1) => trigEval('tan', p1))
    .replace(/sin⁻¹\((.*?)\)/g, (_, p1) => trigEval('asin', p1))
    .replace(/cos⁻¹\((.*?)\)/g, (_, p1) => trigEval('acos', p1))
    .replace(/tan⁻¹\((.*?)\)/g, (_, p1) => trigEval('atan', p1))
    .replace(/log\((.*?)\)/g, 'Math.log10($1)')
    .replace(/ln\((.*?)\)/g, 'Math.log($1)');


  const validPattern = /^[0-9\s()+\-*/.,^πeMathsqrtpowcbtinlgsctPI]+$/;
  if (!validPattern.test(sanitizedExpr.replace(/\(\)/g, ''))) {
    return 'Invalid Expression';
  }

  try {
    const result = new Function('return ' + sanitizedExpr)();
    if (typeof result === 'number' && !isNaN(result)) {
        return Number(result.toPrecision(15));
    }
    return 'Error';
  } catch (error) {
    return 'Error';
  }
};


export default function ScientificCalculatorPage() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isDegrees, setIsDegrees] = useState(true);
  const [memory, setMemory] = useState(0);

  const handleButtonClick = (value: string) => {
    setInput(prev => prev + value);
  };
  
  const handleFunctionClick = (func: string) => {
    setInput(prev => prev + `${func}(`);
  }

  const handleSpecialFunction = (key: string) => {
      let currentInput = input;
      if(key === 'x²') currentInput += '²';
      if(key === 'x³') currentInput += '³';
      if(key === '1/x') currentInput = `1/(${currentInput})`;
      if(key === '%') currentInput += '%';
      if(key === 'n!') currentInput += '!';
      if(key === '+/-') currentInput = `(-${currentInput})`;
      setInput(currentInput);
  }

  const handleCalculate = () => {
    if (input === '') return;
    const result = safeEval(input, isDegrees);
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
  
   const handleMemory = (action: 'M+' | 'M-' | 'MR') => {
    const currentValue = parseFloat(input);
    if(isNaN(currentValue) && action !== 'MR') return;

    if (action === 'M+') {
      setMemory(memory + currentValue);
    } else if (action === 'M-') {
      setMemory(memory - currentValue);
    } else if (action === 'MR') {
      setInput(prev => prev + String(memory));
    }
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
      className={`h-12 text-sm md:text-base font-bold rounded-lg ${className}`}
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
                <div className="grid grid-cols-7 gap-2">
                    <CalculatorButton onClick={() => handleFunctionClick('sin')}>sin</CalculatorButton>
                    <CalculatorButton onClick={() => handleFunctionClick('cos')}>cos</CalculatorButton>
                    <CalculatorButton onClick={() => handleFunctionClick('tan')}>tan</CalculatorButton>
                    <CalculatorButton onClick={() => setIsDegrees(!isDegrees)} variant="outline">{isDegrees ? 'Deg' : 'Rad'}</CalculatorButton>
                    <CalculatorButton onClick={handleDelete}><Eraser className="size-6"/></CalculatorButton>
                    <CalculatorButton onClick={handleClear} variant="destructive">C</CalculatorButton>
                    <CalculatorButton onClick={handleCalculate} variant="default" className="col-start-7">=</CalculatorButton>
                    
                    <CalculatorButton onClick={() => handleFunctionClick('sin⁻¹')}>sin⁻¹</CalculatorButton>
                    <CalculatorButton onClick={() => handleFunctionClick('cos⁻¹')}>cos⁻¹</CalculatorButton>
                    <CalculatorButton onClick={() => handleFunctionClick('tan⁻¹')}>tan⁻¹</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('π')}>π</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('e')}>e</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('(')}>(</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick(')')}>)</CalculatorButton>

                    <CalculatorButton onClick={() => handleButtonClick('^')}>xʸ</CalculatorButton>
                    <CalculatorButton onClick={() => handleSpecialFunction('x³')}>x³</CalculatorButton>
                    <CalculatorButton onClick={() => handleSpecialFunction('x²')}>x²</CalculatorButton>
                    <CalculatorButton onClick={() => handleFunctionClick('e^')}>eˣ</CalculatorButton>
                    <CalculatorButton onClick={() => handleFunctionClick('10^')}>10ˣ</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('7')}>7</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('8')}>8</CalculatorButton>
                    
                    <CalculatorButton onClick={() => handleButtonClick(' y√ ')}>ʸ√x</CalculatorButton>
                    <CalculatorButton onClick={() => handleFunctionClick('³√')}>³√x</CalculatorButton>
                    <CalculatorButton onClick={() => handleFunctionClick('√')}>√x</CalculatorButton>
                    <CalculatorButton onClick={() => handleFunctionClick('ln')}>ln</CalculatorButton>
                    <CalculatorButton onClick={() => handleFunctionClick('log')}>log</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('9')}>9</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('÷')} variant="default">÷</CalculatorButton>
                    
                    <CalculatorButton onClick={() => handleSpecialFunction('n!')}>n!</CalculatorButton>
                    <CalculatorButton onClick={() => handleSpecialFunction('1/x')}>1/x</CalculatorButton>
                    <CalculatorButton onClick={() => handleSpecialFunction('%')}>%</CalculatorButton>
                    <CalculatorButton onClick={() => handleMemory('M-')}>M-</CalculatorButton>
                    <CalculatorButton onClick={() => handleMemory('M+')}>M+</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('4')}>4</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('5')}>5</CalculatorButton>
                    
                    <CalculatorButton onClick={() => handleButtonClick('6')}>6</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('-')} variant="default">-</CalculatorButton>
                    <CalculatorButton onClick={() => handleMemory('MR')}>MR</CalculatorButton>
                    <CalculatorButton onClick={() => handleSpecialFunction('+/-')}>±</CalculatorButton>
                    <CalculatorButton onClick={() => setInput(String(Math.random()))}>RND</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('1')}>1</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('2')}>2</CalculatorButton>

                    <CalculatorButton onClick={() => handleButtonClick('3')}>3</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('+')} variant="default">+</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('0')} className="col-span-2">0</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('.')}>.</CalculatorButton>
                    <CalculatorButton onClick={() => handleButtonClick('E')}>EXP</CalculatorButton>
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
                             You can switch between Degrees and Radians using the "Deg/Rad" toggle button. When "Deg" is active, trigonometric functions expect the input angle in **degrees**. When "Rad" is active, they expect radians. The calculator handles the necessary conversions automatically.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What is the difference between 'log' and 'ln'?</AccordionTrigger>
                            <AccordionContent>
                            'log' represents the base-10 logarithm, which answers the question "10 to what power gives this number?". 'ln' represents the natural logarithm, which uses the mathematical constant 'e' (approximately 2.718) as its base. Both are crucial in various scientific and financial calculations.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>How do I use the memory (M+, M-, MR) functions?</AccordionTrigger>
                            <AccordionContent>
                            The memory functions allow you to store a number for later use.
                            <ul className="list-disc pl-5 mt-2">
                                <li><strong>M+</strong>: Adds the current number on the display to the value in memory.</li>
                                <li><strong>M-</strong>: Subtracts the current number on the display from the value in memory.</li>
                                <li><strong>MR</strong>: Recalls the value from memory and inserts it into your current expression.</li>
                            </ul>
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
