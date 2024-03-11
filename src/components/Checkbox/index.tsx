
import './styles.css'
interface Props extends InputProps {
}

type InputProps = JSX.IntrinsicElements['input'];

export function Checkbox({ ...rest }: Props) {

    return (
        <>
            <label className="form-control text-gray-600 cursor-pointer">
                <input {...rest} type="checkbox" name="checkbox" />
                <span className='ml-1'>{rest.name}</span>
            </label>
        </>
    );
}