import { parse, v4 as uuidv4 } from 'uuid';

import styles from './Project.module.css';

import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Loading from '../layout/Loading';
import Container from '../layout/Container';
import Message from '../layout/Message';
import ProjectForm from '../project/ProjectForm';
import ServiceForm from '../service/ServiceForm';

export default function Project() {
  const { id } = useParams(); //para pegar o id vindo da url.

  const [project, setProject] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');

  useEffect(() => {
    setTimeout(() => {
      fetch(`http://localhost:5000/projects/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((resp) => resp.json())
        .then((data) => {
          setProject(data);
        })
        .catch();
    }, 300);
  }, [id]);

  function createService(project) {
    const lastService = project.services[project.services.length - 1];

    lastService.id = uuidv4();

    const lastServiceCost = lastService.cost;

    const newCost = parseFloat(project.cost) + parseFloat(lastServiceCost);

    //Maximin value validation
    if (newCost > parseFloat(project.budget)) {
      setMessage('Orçamento ultrapassado');
      setType('error');
      project.services.pop();
      return false;
    }

    //add service cost to project total cost
    project.cost = newCost;

    //update project
    fetch(`http://localhost:5000/projects/${project.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    })
      .then((resp) => resp.json())
      .then((data) => {
        //exibir os serviços
      })
      .catch((err) => console.log(err));
  }

  function toggleProjectForm() {
    setShowProjectForm(!showProjectForm); //inverte false=>true e true=>false.
  }

  function toggleServiceForm() {
    setShowServiceForm(!showServiceForm); //inverte false=>true e true=>false.
  }

  function editPost(project) {
    setMessage('');

    if (project.budget < project.cost) {
      setMessage('O orçamento não pode ser menor que o custo do projeto');
      setType('error');
      return false;
    }

    fetch(`http://localhost:5000/projects/${project.id}`, {
      method: 'PATCH', //muda apenas aquilo que foi alterado
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    })
      .then((resp) => resp.json())
      .then((data) => {
        setProject(data);
        setShowProjectForm(false);
        setMessage('Projeto atualizado');
        setType('success');
      })
      .catch((err) => console.log(err));
  }
  return (
    <>
      {project.name ? (
        <div className={styles.project_details}>
          <Container customClass='column'>
            {message && <Message type={type} msg={message} />}
            <div className={styles.details_container}>
              <h1>Projeto: {project.name}</h1>
              <button onClick={toggleProjectForm} className={styles.btn}>
                {!showProjectForm ? 'Editar' : 'Fechar'}
              </button>
              {!showProjectForm ? (
                <div className={styles.project_info}>
                  <p>
                    <span>Categoria:</span> {project.category.name}
                  </p>

                  <p>
                    <span>Total Orçamento:</span> R$ {project.budget}
                  </p>

                  <p>
                    <span>Total Utilizado:</span> R$ {project.cost}
                  </p>
                </div>
              ) : (
                <div className={styles.project_info}>
                  <ProjectForm
                    handleSubmit={editPost}
                    btnText='Concluir'
                    projectData={project}
                  />
                </div>
              )}
            </div>

            <div className={styles.service_form_container}>
              <h2>Adicione um serviço:</h2>
              <button onClick={toggleServiceForm} className={styles.btn}>
                {!showServiceForm ? 'Adicionar' : 'Fechar'}
              </button>
              <div className={styles.project_info}>
                {showServiceForm && (
                  <ServiceForm
                    handleSubmit={createService}
                    btnText='adicionar serviço'
                    projectData={project}
                  />
                )}
              </div>
            </div>

            <h2>Serviços</h2>
            <Container customClass='start'>
              <p>Itens</p>
            </Container>
          </Container>
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
}
