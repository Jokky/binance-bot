export const computePL = (markPrice: number, purchasePrice: number, quantity: number) =>
    (purchasePrice - markPrice) * quantity;