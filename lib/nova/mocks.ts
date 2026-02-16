export const MOCK_DATA = {
    COMMERCIAL_INVOICE: {
        SUMMARY: `**Analysis of Commercial Invoice CI-2024-001**

*   **Document Type**: Commercial Invoice
*   **Parties**:
    *   **Shipper**: Shenzhen Tech Mfg. (China)
    *   **Consignee**: NovaVision Logistics LLC (Seattle, USA)
*   **Shipment Details**:
    *   **Origin**: Shenzhen, China
    *   **Destination**: Seattle, WA, USA
    *   **Port of Loading**: Yantian, CN
    *   **Port of Discharge**: Seattle, US
*   **Incoterms**: FOB Shenzhen
*   **Key Goods**: Consumer Electronics (Security Cameras, Mounts, Cables)
*   **Critical Alerts**: None. Document is fully signed and stamped.

**Summary**: This is a clean, compliant commercial invoice for 1,200 units of electronic goods with a total value of $25,700.00. Ready for Customs Entry.`,

        COMPLIANCE: `**Trade Compliance Audit**

*   **Sanctions Check**: ✅ **CLEARED**. "Shenzhen Tech Mfg" is not on OFAC/BIS restricted entity lists.
*   **Hazardous Materials**: ✅ **NONE DETECTED**. No battery/chemical warnings found.
*   **Restricted Items**: ⚠️ **REVIEW REQUIRED**. "Wireless Security Cameras" (HS 8525.80) may require FCC certification forms.
*   **Documentation Gaps**: ✅ **NONE**. Signature and Date (Oct 24, 2024) are present.

**Risk Level**: **LOW**. Proceed with standard filing.`,

        EXTRACTION: {
            invoice_number: "CI-2024-001",
            date: "2024-10-24",
            vendor: {
                name: "Shenzhen Tech Mfg.",
                address: "No. 88, Science Park Road, Nanshan District, Shenzhen, China"
            },
            buyer: {
                name: "NovaVision Logistics LLC",
                address: "1200 Twelfth Ave S, Seattle, WA 98144"
            },
            currency: "USD",
            total_amount: 25700.00,
            line_items: [
                { description: "Wireless Security Camera (1080p)", hs_code: "8525.80", quantity: 500, unit_price: 45.00, total: 22500.00 },
                { description: "Wall Mount Bracket", hs_code: "7326.90", quantity: 500, unit_price: 5.00, total: 2500.00 },
                { description: "Power Extension Cable (5M)", hs_code: "8544.42", quantity: 200, unit_price: 3.50, total: 700.00 }
            ],
            weights: {
                gross: "4500 KGS",
                net: "Not Listed"
            }
        }
    }
};
