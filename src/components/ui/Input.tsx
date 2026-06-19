interface InputProps {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
}

export default function Input({id, type, label, placeholder} : InputProps){
    return(
        <div>
            <label htmlFor={id} className="text-size-sm text-text-base">{label}</label>
            <input
            id = {id}
            type = {type}
            placeholder={placeholder}
            className="border border-card-muted rounded-card px-3 py-2 outline-none focus:ring-2 focus:ring-border-focus"
            />
        </div>
    )
}