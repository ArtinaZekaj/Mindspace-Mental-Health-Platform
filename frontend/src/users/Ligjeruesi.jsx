import React, { useEffect, useState } from "react";

export default function Ligjeruesi() {

    const [emri, setEmri] = useState("");
    const [mbiemri , setMbiemri] = useState("");
    const [specializimi, setSpecializimi] = useState("");
    const [ligjeruesit, setLigjeruesit] = useState([]);
    const [editId, setEditId] = useState(null);
    const [message, setMessage] = useState("");


    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/ligjeruesit")
            .then((res) => res.json())
            .then((data) => setLigjeruesit(data));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const ligjeruesi = {
            Emri: emri,
            Mbiemri: mbiemri,
            Specializmi: specializimi,
        };

        if (editId) {
            fetch(`http://127.0.0.1:8000/api/ligjeruesit/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ligjeruesi),
            })
                .then((res) => res.json())
                .then((updated) => {
                    setLigjeruesit(
                        ligjeruesit.map((l) =>
                            l.LigjeruesiID === editId ? updated : l
                        )
                    );
                    setMessage("Ligjeruesi u perditsu me sukses ");
                    resetForm();
                });
        } else {
            fetch("http://127.0.0.1:8000/api/ligjeruesit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ligjeruesi),
            })
                .then((res) => res.json())
                .then((data) => {
                    setLigjeruesit([...ligjeruesit, data]);
                    setMessage("Ligjeruesi u shtu me sukses ");
                    resetForm();
                });
        }
    };

    const handleEdit = (l) => {
        setEmri(l.Emri);
        setMbiemri(l.Mbiemri);
        setSpecializimi(l.Specializmi);
        setEditId(l.LigjeruesiID);
    };

    const handleDelete = (id) => {
        fetch(`http://127.0.0.1:8000/api/ligjeruesit/${id}`, {
            method: "DELETE",
        }).then(() => {
            setLigjeruesit(ligjeruesit.filter((l) => l.LigjeruesiID !== id));

            setMessage("Ligjeruesi u fshi me sukses ");

            setTimeout(() => setMessage(""), 3000);
        });
    };

    const resetForm = () => {
        setEditId(null);
        setEmri("");
        setMbiemri("");
        setSpecializimi("");
    };

    return (
        <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
            <h2 style={{ marginBottom: "20px", color: "#333" }}>Menaxhimi i Ligjeruesve</h2>

            {message && (
                <div style={{ marginBottom: "15px", color: "green", fontWeight: "bold" }}>
                    {message}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    background: "#f9f9f9",
                    padding: "15px",
                    borderRadius: "8px",
                }}
            >
                <input
                    type="text"
                    placeholder="Emri"
                    value={emri}
                    onChange={(e) => setEmri(e.target.value)}
                    style={{ flex: "1", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />

                <input
                    type="text"
                    placeholder="Mbiemri"
                    value={mbiemri}
                    onChange={(e) => setMbiemri(e.target.value)}
                    style={{ flex: "1", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />

                <input
                    type="text"
                    placeholder="Specializimi"
                    value={specializimi}
                    onChange={(e) => setSpecializimi(e.target.value)}
                    style={{ flex: "1", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />

                <button
                    type="submit"
                    style={{
                        padding: "8px 16px",
                        background: editId ? "#ff9800" : "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    {editId ? "Update" : "Add"}
                </button>

                {editId && (
                    <button
                        type="button"
                        onClick={resetForm}
                        style={{
                            padding: "8px 16px",
                            background: "#9e9e9e",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
                <thead>
                    <tr style={{ background: "#f1f1f1" }}>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Emri</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Mbiemri</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Specializimi</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Veprime</th>
                    </tr>
                </thead>
                <tbody>
                    {ligjeruesit.map((l) => (
                        <tr key={l.LecturerID}>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{l.Emri}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{l.Mbiemri}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{l.Specializmi}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                
                                <button
                                    onClick={() => handleEdit(l)}
                                    style={{
                                        marginRight: "8px",
                                        padding: "4px 8px",
                                        background: "#2196F3",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Edito
                                </button>

                                <button
                                    onClick={() => handleDelete(l.LigjeruesiID)}
                                    style={{
                                        padding: "4px 8px",
                                        background: "#f44336",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
