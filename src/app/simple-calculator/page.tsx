
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function SimpleCalculatorPage() {
  const [input, setInput] = useState('');
  const [previousInput, setPreviousInput] = useState('');
  const [operator, setOperator] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const handleNumberClick = (value: string) => {
    setInput(prev => prev + value);
  };

  const handleOperatorClick = (op: string) => {
    if (input === '' && previousInput === '') return;
    if (input === '' && previousInput !== '') {
        setOperator(op);
        return;
    }
    if (previousInput !== '') {
      calculate(false);
      setOperator(op);
    } else {
      setPreviousInput(input);
      setInput('');
      setOperator(op);
    }
  };

  const calculate = (addToHistory = true) => {
    if (previousInput === '' || input === '' || operator === '') return;
    const prev = parseFloat(previousInput);
    const curr = parseFloat(input);
    let result;
    switch (operator) {
      case '+':
        result = prev + curr;
        break;
      case '-':
        result = prev - curr;
        break;
      case '×':
        result = prev * curr;
        break;
      case '÷':
        if(curr === 0) {
            setInput('Error');
            setPreviousInput('');
            setOperator('');
            return;
        }
        result = prev / curr;
        break;
      default:
        return;
    }
    const finalResult = String(result);
    
    if(addToHistory){
      const calculation = `${previousInput} ${operator} ${input} = ${finalResult}`;
      setHistory(prevHistory => [calculation, ...prevHistory].slice(0, 10));
      setInput(finalResult);
      setPreviousInput('');
      setOperator('');
    } else {
        setPreviousInput(finalResult);
        setInput('');
    }

  };

  const handleEqualsClick = () => {
    calculate();
  };

  const handleClear = () => {
    setInput('');
    setPreviousInput('');
    setOperator('');
  };
  
  const handleDelete = () => {
      setInput(input.slice(0, -1));
  }

  const handleDecimalClick = () => {
      if(!input.includes('.')) {
          setInput(input + '.');
      }
  }

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
      className={`h-16 text-2xl font-bold rounded-lg ${className}`}
      variant={variant as any}
    >
      {children}
    </Button>
  );

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Simple Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle className="font-headline text-center">Calculator</CardTitle>
                <CardDescription className="text-center">For basic arithmetic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-lg border bg-muted p-4 text-right">
                  <div className="min-h-[28px] text-sm text-muted-foreground">
                    {previousInput} {operator}
                  </div>
                  <div className="text-4xl font-bold break-all">{input || '0'}</div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <CalculatorButton onClick={handleClear} className="col-span-2" variant="destructive">AC</CalculatorButton>
                  <CalculatorButton onClick={handleDelete}><Eraser className="size-6"/></CalculatorButton>
                  <CalculatorButton onClick={() => handleOperatorClick('÷')} variant="default">÷</CalculatorButton>

                  <CalculatorButton onClick={() => handleNumberClick('7')}>7</CalculatorButton>
                  <CalculatorButton onClick={() => handleNumberClick('8')}>8</CalculatorButton>
                  <CalculatorButton onClick={() => handleNumberClick('9')}>9</CalculatorButton>
                  <CalculatorButton onClick={() => handleOperatorClick('×')} variant="default">×</CalculatorButton>
                  
                  <CalculatorButton onClick={() => handleNumberClick('4')}>4</CalculatorButton>
                  <CalculatorButton onClick={() => handleNumberClick('5')}>5</CalculatorButton>
                  <CalculatorButton onClick={() => handleNumberClick('6')}>6</CalculatorButton>
                  <CalculatorButton onClick={() => handleOperatorClick('-')} variant="default">-</CalculatorButton>
                  
                  <CalculatorButton onClick={() => handleNumberClick('1')}>1</CalculatorButton>
                  <CalculatorButton onClick={() => handleNumberClick('2')}>2</CalculatorButton>
                  <CalculatorButton onClick={() => handleNumberClick('3')}>3</CalculatorButton>
                  <CalculatorButton onClick={() => handleOperatorClick('+')} variant="default">+</CalculatorButton>

                  <CalculatorButton onClick={() => handleNumberClick('0')} className="col-span-2">0</CalculatorButton>
                  <CalculatorButton onClick={handleDecimalClick}>.</CalculatorButton>
                  <CalculatorButton onClick={handleEqualsClick} variant="default">=</CalculatorButton>
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
                        <AccordionItem value="item-1" className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 mb-2">
                            <AccordionTrigger>How do I use this calculator?</AccordionTrigger>
                            <AccordionContent>
                            Simply use the buttons to input your numbers and select an operator (+, -, ×, ÷). The calculator performs operations sequentially. Press the '=' button to see the final result of your calculation.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="bg-green-50 dark:bg-green-900/20 rounded-lg px-4 mb-2">
                            <AccordionTrigger>What does the 'AC' button do?</AccordionTrigger>
                            <AccordionContent>
                            The 'AC' (All Clear) button completely resets the calculator. It clears the current input, any previous input, the selected operator, and the entire calculation history.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 mb-2">
                            <AccordionTrigger>How does the history feature work?</AccordionTrigger>
                            <AccordionContent>
                            The calculator automatically saves your last 10 complete calculations in the history panel. Each time you press the '=' button to get a result, that calculation is added to the top of the list.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4" className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-4 mb-2">
                            <AccordionTrigger>Does this calculator follow the order of operations (PEMDAS/BODMAS)?</AccordionTrigger>
                            <AccordionContent>
                            No, this is a simple calculator that processes operations sequentially as they are entered. For example, `2 + 3 × 4` will be calculated as `(2 + 3) × 4 = 20`, not `2 + (3 × 4) = 14`. For complex calculations requiring order of operations, a scientific calculator should be used.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5" className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 mb-2">
                            <AccordionTrigger>How do I correct a mistake?</AccordionTrigger>
                            <AccordionContent>
                            You can use the backspace button (with the eraser icon) to delete the last digit you entered in the current input. If you need to change the entire number or start over, use the 'AC' button.
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
