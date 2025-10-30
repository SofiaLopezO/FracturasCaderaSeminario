"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";

import RoleGuard from "@/components/RoleGuard";
import ExamFormFrame from "@/components/Tecnologo/ExamFormFrame";
import { useTecnologo } from "@/contexts/TecnologoContext";
import { Upload, FileText, X, ImageIcon, FileImage, Plus } from "lucide-react";

type StudyType = "RAYOS_X" | "ECOGRAFIA" | "TAC" | "RM" | "OTRO";

type ParamFromApi = {
  codigo: string;
  nombre: string;
  unidad: string; // puede venir '' si no tiene
};

type ManualRow = {
  id: number;
  parametro: string; // codigo
  valor: string;
  unidad: string;
};

export default function Page() {
  const { paciente } = useTecnologo();

  // ---- Metadatos del estudio
  const [tipoEstudio, setTipoEstudio] = useState<StudyType>("RAYOS_X");

  // ---- Filas manuales (parámetro/resultado/unidad)
  const [manualRows, setManualRows] = useState<ManualRow[]>([
    { id: 1, parametro: "", valor: "", unidad: "" },
  ]);

  const addManualRow = () => {
    const newId = Math.max(...manualRows.map((r) => r.id)) + 1;
    setManualRows([...manualRows, { id: newId, parametro: "", valor: "", unidad: "" }]);
  };

  const removeManualRow = (id: number) => {
    if (manualRows.length > 1) setManualRows((rows) => rows.filter((r) => r.id !== id));
  };

  const onChangeValor = (rowId: number, valor: string) => {
    setManualRows((rows) => rows.map((r) => (r.id === rowId ? { ...r, valor } : r)));
  };

  // ---- Zona de archivos
  const [isDragOverImages, setIsDragOverImages] = useState(false);
  const [isDragOverPdf, setIsDragOverPdf] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);

  const handleDragOverImages = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverImages(true);
  };
  const handleDragLeaveImages = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverImages(false);
  };
  const handleDropImages = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverImages(false);
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter((file) => file.type.startsWith("image/") || file.name.endsWith(".dcm"));
    setSelectedImages((prev) => [...prev, ...validFiles]);
  };
  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(
        (file) => file.type.startsWith("image/") || file.name.endsWith(".dcm"),
      );
      setSelectedImages((prev) => [...prev, ...validFiles]);
    }
  };
  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOverPdf = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverPdf(true);
  };
  const handleDragLeavePdf = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverPdf(false);
  };
  const handleDropPdf = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverPdf(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") setSelectedPdf(file);
    }
  };
  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) setSelectedPdf(files[0]);
  };
  const removePdf = () => setSelectedPdf(null);

  // ---- Catálogo de parámetros por tipo de estudio
  const [paramOptions, setParamOptions] = useState<ParamFromApi[]>([]);
  const [paramsLoading, setParamsLoading] = useState(false);
  const [paramsError, setParamsError] = useState<string | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1";

  useEffect(() => {
    const controller = new AbortController();
    setParamsLoading(true);
    setParamsError(null);

    fetch(
      `${apiBase}/parametros/imagen?tipo_estudio=${encodeURIComponent(tipoEstudio)}`,
      { credentials: "include", signal: controller.signal },
    )
      .then(async (r) => {
        if (!r.ok) {
          const msg = (await r.json().catch(() => null))?.error || "Error al cargar parámetros";
          throw new Error(msg);
        }
        return r.json() as Promise<ParamFromApi[]>;
      })
      .then((rows) => setParamOptions(rows || []))
      .catch((err) => {
        if (err?.name !== "AbortError") setParamsError(err?.message || "Error al cargar parámetros");
      })
      .finally(() => setParamsLoading(false));

    // al cambiar tipo de estudio, limpiar selección de parámetros
    setManualRows((rows) => rows.map((r) => ({ ...r, parametro: "", unidad: "" })));

    return () => controller.abort();
  }, [tipoEstudio, apiBase]);

  const hasParams = useMemo(() => paramOptions.length > 0, [paramOptions]);

  const onChangeParam = (rowId: number, codigo: string) => {
    const def = paramOptions.find((p) => p.codigo === codigo);
    setManualRows((rows) =>
      rows.map((r) => (r.id === rowId ? { ...r, parametro: codigo, unidad: def?.unidad ?? "" } : r)),
    );
  };

  // ---- Reset local tras guardar OK (lo maneja ExamFormFrame)
  const handleSuccess = () => {
    setSelectedImages([]);
    setSelectedPdf(null);
    setTipoEstudio("RAYOS_X");
    setManualRows([{ id: 1, parametro: "", valor: "", unidad: "" }]);
  };

  return (
    <RoleGuard allow={["tecnologo"]}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Subir imágenes de diagnóstico</h1>
        <p className="text-slate-600 mt-2">Carga y registro de estudios de imagen</p>
      </div>

      {/* examType controla el tipo en el payload */}
      <ExamFormFrame paciente_id={paciente?.user_id} examType="IMAGEN" onSuccess={handleSuccess}>
        {/* Metadatos principales */}
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Tipo de estudio</span>
            <select
              name="tipo_estudio"
              className="border rounded-lg px-3 py-2"
              value={tipoEstudio}
              onChange={(e) => setTipoEstudio(e.target.value as StudyType)}
            >
              <option value="RAYOS_X">Rayos X</option>
              <option value="ECOGRAFIA">Ecografía</option>
              <option value="TAC">TAC</option>
              <option value="RM">Resonancia Magnética</option>
              <option value="OTRO">Otro</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Fecha/hora del estudio</span>
            <input name="fecha_estudio" type="datetime-local" className="border rounded-lg px-3 py-2" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Fecha/hora de recepción</span>
            <input name="fecha_recepcion" type="datetime-local" className="border rounded-lg px-3 py-2" />
          </label>
        </div>

        {/* Estado de catálogo */}
        {paramsLoading && <div className="text-sm text-slate-500 mt-2">Cargando parámetros…</div>}
        {paramsError && <div className="text-sm text-red-600 mt-2">{paramsError}</div>}
        {!paramsLoading && !hasParams && (
          <div className="text-sm text-slate-500 mt-2">No hay parámetros configurados para este estudio.</div>
        )}

        {/* Filas de resultados (Parámetro / Resultado / Unidad) */}
        <div className="mt-4">
          <div className="text-sm text-slate-600 mb-2">Ingrese los resultados manualmente:</div>

          <div className="space-y-3">
            {manualRows.map((row) => (
              <div key={row.id} className="flex items-start gap-2">
                <div className="grid gap-2 sm:grid-cols-3 flex-1">
                  <select
                    name={`resultado_${row.id}_parametro`}
                    className="border rounded-lg px-3 py-2"
                    value={row.parametro}
                    onChange={(e) => onChangeParam(row.id, e.target.value)}
                    disabled={!hasParams}
                  >
                    <option value="">{hasParams ? "Seleccionar parámetro" : "Sin opciones"}</option>
                    {paramOptions.map((p) => (
                      <option key={p.codigo} value={p.codigo}>
                        {p.nombre} ({p.unidad || "sin unidad"})
                      </option>
                    ))}
                  </select>

                  <input
                    name={`resultado_${row.id}_valor`}
                    placeholder="Resultado (p. ej. 95)"
                    className="border rounded-lg px-3 py-2"
                    value={row.valor}
                    onChange={(e) => onChangeValor(row.id, e.target.value)}
                    inputMode="decimal"
                  />

                  <input
                    name={`resultado_${row.id}_unidad`}
                    placeholder="Unidad"
                    className="border rounded-lg px-3 py-2 bg-gray-100 text-gray-700"
                    value={row.unidad}
                    readOnly
                  />
                </div>

                {manualRows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeManualRow(row.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Eliminar fila"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addManualRow}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
            >
              <Plus className="w-4 h-4" />
              Agregar fila
            </button>
          </div>
        </div>

        {/* Subidas de archivos */}
        <div className="mt-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Imágenes */}
            <div className="flex-1 space-y-2">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Adjuntar imágenes
              </span>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  isDragOverImages
                    ? "border-blue-400 bg-blue-50 scale-105"
                    : selectedImages.length > 0
                    ? "border-green-400 bg-green-50"
                    : "border-slate-300 hover:border-slate-400 hover:bg-slate-50/50"
                }`}
                onDragOver={handleDragOverImages}
                onDragLeave={handleDragLeaveImages}
                onDrop={handleDropImages}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,.dcm"
                  onChange={handleImagesSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  name="imagenes"
                />

                {selectedImages.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedImages.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-green-200 shadow-sm"
                        >
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FileImage className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-medium text-slate-900 truncate">{file.name}</div>
                            <div className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-all"
                            title="Remover imagen"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-green-600 font-medium">
                      {selectedImages.length} imagen{selectedImages.length !== 1 ? "es" : ""} seleccionada
                      {selectedImages.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className={`p-3 rounded-full ${isDragOverImages ? "bg-blue-100" : "bg-slate-100"} transition-colors`}>
                      <Upload className={`w-8 h-8 ${isDragOverImages ? "text-blue-500" : "text-slate-400"}`} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-900 mb-1">
                        {isDragOverImages ? "Suelte las imágenes aquí" : "Arrastra y suelta tus imágenes"}
                      </p>
                      <p className="text-sm text-slate-500">
                        o <span className="text-blue-600 font-medium hover:text-blue-700 cursor-pointer">haz clic para seleccionar</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                      <FileImage className="w-3 h-3" />
                      <span>JPG, PNG, DICOM (.dcm)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PDF */}
            <div className="flex-1 space-y-2">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Adjuntar informe (PDF opcional)
              </span>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  isDragOverPdf
                    ? "border-blue-400 bg-blue-50 scale-105"
                    : selectedPdf
                    ? "border-green-400 bg-green-50"
                    : "border-slate-300 hover:border-slate-400 hover:bg-slate-50/50"
                }`}
                onDragOver={handleDragOverPdf}
                onDragLeave={handleDragLeavePdf}
                onDrop={handleDropPdf}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  name="informe_pdf"
                />

                {selectedPdf ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-green-200 shadow-sm">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-slate-900">{selectedPdf.name}</div>
                        <div className="text-sm text-slate-500">{(selectedPdf.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <button
                        type="button"
                        onClick={removePdf}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                        title="Remover archivo"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-green-600 font-medium">Informe PDF seleccionado</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className={`p-3 rounded-full ${isDragOverPdf ? "bg-blue-100" : "bg-slate-100"} transition-colors`}>
                      <Upload className={`w-8 h-8 ${isDragOverPdf ? "text-blue-500" : "text-slate-400"}`} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-900 mb-1">
                        {isDragOverPdf ? "Suelte el PDF aquí" : "Arrastra y suelta tu PDF"}
                      </p>
                      <p className="text-sm text-slate-500">
                        o <span className="text-blue-600 font-medium hover:text-blue-700 cursor-pointer">haz clic para seleccionar</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                      <FileText className="w-3 h-3" />
                      <span>Solo archivos PDF</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ExamFormFrame>
    </RoleGuard>
  );
}
