import React, {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import './styles.css';
import {FiUpload} from 'react-icons/fi';
 
interface Props {
  FileDropzone: (file: File) => void;
}

const FileDropzone: React.FC<Props> = ({FileDropzone}: Props)  => {
  const [selectedFileURL, setSelectedFileURL] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    const [firstFile] = acceptedFiles;
    
    const urlFile = URL.createObjectURL(firstFile);
    setSelectedFileURL(urlFile);
    FileDropzone(firstFile);
  }, [FileDropzone])
  
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
     accept: 'image/*'})
 //posso usar o multiple no input para ceitar varios arquivos
  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()}  accept="image/*"/> 
      {
        selectedFileURL 
        ?
          <img src={selectedFileURL} alt="Pré visualização do ponto de coleta" />
        :
          <>
          {
        
            isDragActive ?
              <p> <FiUpload />  Solte uma foto do ponto de coleta aqui!.</p> :
              <p> <FiUpload /> Colocar uma imagem do ponto de coleta</p>
          }
          </>
      }
     
    </div>
  )
}

export default FileDropzone;