function FormField({ id, label, type = "text", value, onChange, placeholder, error }) {
    return (
        <>
            <label htmlFor={id}>{label}</label>
            <input
                id={id} type={type} value={value}
                onChange={onChange} placeholder={placeholder}
                className={error ? "input-error" : ""}
            />
            {error && <p className="field-error">{error}</p>}
        </>
    );
}

export default FormField;