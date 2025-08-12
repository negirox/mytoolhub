
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';

export default function SimpleCalculatorPage() {
  const [input, setInput] = useState('');
  const [previousInput, setPreviousInput] = useState('');
  const [operator, setOperator] = useState('');

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
      calculate();
      setOperator(op);
    } else {
      setPreviousInput(input);
      setInput('');
      setOperator(op);
    }
  };

  const calculate = () => {
    if (previousInput === '' || input === '') return;
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
        result = prev / curr;
        break;
      default:
        return;
    }
    setInput(String(result));
    setPreviousInput('');
    setOperator('');
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
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <Card className="w-full max-w-sm shadow-2xl">
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
      </main>
    </>
  );
}
