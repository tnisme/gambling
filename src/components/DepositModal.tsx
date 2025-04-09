import React, { useState } from 'react';
import styled from 'styled-components';
import { createDeposit } from '../services/depositService';
import { useAuth } from '../contexts/AuthContext';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDepositSuccess: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onDepositSuccess }) => {
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { setUser } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const depositAmount = parseFloat(amount);
            if (isNaN(depositAmount) || depositAmount <= 0) {
                throw new Error('Please enter a valid amount');
            }

            const response = await createDeposit(depositAmount, paymentMethod);
            onDepositSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process deposit');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h2>Make a Deposit</h2>
                    <CloseButton onClick={onClose}>×</CloseButton>
                </ModalHeader>
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>Amount ($)</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            min="0"
                            step="0.01"
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Payment Method</Label>
                        <Select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            required
                        >
                            <option value="credit_card">Credit Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="crypto">Cryptocurrency</option>
                        </Select>
                    </FormGroup>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    <ButtonGroup>
                        <Button type="button" onClick={onClose} secondary>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Deposit'}
                        </Button>
                    </ButtonGroup>
                </Form>
            </ModalContent>
        </ModalOverlay>
    );
};

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: ${props => props.theme.colors.background};
    padding: 2rem;
    border-radius: 15px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h2 {
        color: ${props => props.theme.colors.white};
        margin: 0;
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: ${props => props.theme.colors.white};
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    line-height: 1;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    color: ${props => props.theme.colors.white};
    font-size: 0.9rem;
`;

const Input = styled.input`
    padding: 0.8rem;
    border: 1px solid ${props => props.theme.colors.secondary};
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: ${props => props.theme.colors.white};
    font-size: 1rem;

    &:focus {
        outline: none;
        border-color: ${props => props.theme.colors.primary};
    }
`;

const Select = styled.select`
    padding: 0.8rem;
    border: 1px solid ${props => props.theme.colors.secondary};
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: ${props => props.theme.colors.white};
    font-size: 1rem;

    &:focus {
        outline: none;
        border-color: ${props => props.theme.colors.primary};
    }

    option {
        background: ${props => props.theme.colors.background};
        color: ${props => props.theme.colors.white};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
`;

const Button = styled.button<{ secondary?: boolean }>`
    flex: 1;
    padding: 0.8rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    ${props => props.secondary ? `
        background: transparent;
        border: 1px solid ${props.theme.colors.primary};
        color: ${props.theme.colors.white};
        
        &:hover {
            background: rgba(255, 215, 0, 0.1);
        }
    ` : `
        background: ${props.theme.colors.primary};
        color: ${props.theme.colors.white};
        
        &:hover {
            background: ${props.theme.colors.secondary};
        }
    `}

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.div`
    color: ${props => props.theme.colors.darkRed};
    background: rgba(255, 0, 0, 0.1);
    padding: 0.8rem;
    border-radius: 8px;
    font-size: 0.9rem;
`;

export default DepositModal; 