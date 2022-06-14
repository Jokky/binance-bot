export const computePNL = (markPrice: number, purchasePrice: number, quantity: number) =>
    (markPrice - purchasePrice) * quantity;