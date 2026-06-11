import { verifyLedgerBalance } from "../service/ledgerService.js";

export const verifikasiLedge = async (request: any, reply: any) => {
  try {
    const { id } = request.params;

    const result = await verifyLedgerBalance(id);

    return reply.status(200).json({
      msg: "berhasil terversifikasi",
      data: result,
    });
  } catch (error) {
    return reply.status(400).json({
      msg: "gagal terversifikasi",
    });
  }
};
